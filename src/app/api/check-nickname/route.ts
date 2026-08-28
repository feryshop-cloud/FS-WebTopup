import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

async function hitCoda(body: string) {
  const response = await fetch("https://order-sg.codashop.com/initPayment.action", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
    body,
  });
  return await response.json();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const server = searchParams.get("server") || searchParams.get("zone");
  const game = searchParams.get("game");

  if (!id) {
    return NextResponse.json({ success: false, message: "Bad request" }, { status: 400 });
  }

  let result;
  try {
    switch (game) {
      case "ml":
        result = await ml(Number(id), Number(server));
        break;
      case "ff":
        result = await ff(Number(id));
        break;
      case "cod":
        result = await cod(Number(id));
        break;
      case "gi":
        result = await gi(Number(id));
        break;
      case "pb":
        result = await pb(Number(id));
        break;
      case "sus":
        result = await sus(Number(id));
        break;
      case "valo":
        result = await valo(Number(id));
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Game not supported" },
          { status: 400 },
        );
    }
    return NextResponse.json(result);
  } catch (err) {
    logger.error("Gagal mengecek nickname", { error: err });
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
}

async function ml(id: number, zone: number) {
  const body = `voucherPricePoint.id=4150&voucherPricePoint.price=1579&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${zone}&voucherTypeName=MOBILE_LEGENDS&shopLang=id_ID&voucherTypeId=1&gvtId=1`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: "Mobile Legends: Bang Bang",
    id,
    server: zone,
    name: data.confirmationFields.username,
  };
}

async function ff(id: number) {
  const body = `voucherPricePoint.id=8050&voucherPricePoint.price=1000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=FREEFIRE&shopLang=id_ID&voucherTypeId=1&gvtId=1`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: "Garena Free Fire",
    id,
    name: data.confirmationFields.roles[0].role,
  };
}

async function cod(id: number) {
  const body = `voucherPricePoint.id=46114&voucherPricePoint.price=5000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=CALL_OF_DUTY&shopLang=id_ID&voucherTypeId=1&gvtId=1`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: "Call Of Duty",
    id,
    name: data.confirmationFields.roles[0].role,
  };
}

async function gi(id: number) {
  let sn = "";
  let sv = "";
  const idStr = String(id);

  switch (idStr[0]) {
    case "6":
      sn = "America";
      sv = "os_usa";
      break;
    case "7":
      sn = "Europe";
      sv = "os_euro";
      break;
    case "8":
      sn = "Asia";
      sv = "os_asia";
      break;
    case "9":
      sn = "SAR (Taiwan, Hong Kong, Macao)";
      sv = "os_cht";
      break;
    default:
      return {
        success: false,
        message: "Invalid ID for Genshin Impact",
      };
  }

  const body = `voucherPricePoint.id=116054&voucherPricePoint.price=16500&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=${sv}&voucherTypeName=GENSHIN_IMPACT&shopLang=id_ID`;

  const data = await hitCoda(body);

  if (data.confirmationFields.username) {
    return {
      success: true,
      game: "Genshin Impact",
      id,
      server: sn,
      name: data.confirmationFields.username,
    };
  } else {
    return {
      success: false,
      message: "Not found",
    };
  }
}

async function pb(id: number) {
  const body = `voucherPricePoint.id=54700&voucherPricePoint.price=11000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=&voucherTypeName=POINT_BLANK&shopLang=id_ID`;
  const data = await hitCoda(body);
  if (data.confirmationFields.username) {
    return {
      success: true,
      game: "Point Blank",
      id,
      name: data.confirmationFields.username,
    };
  } else {
    return {
      success: false,
      message: "Not found",
    };
  }
}

async function sus(id: number) {
  const body = `voucherPricePoint.id=256513&voucherPricePoint.price=16000&voucherPricePoint.variablePrice=0&user.userId=${id}&user.zoneId=global-release&voucherTypeName=SAUSAGE_MAN&shopLang=id_ID`;
  const data = await hitCoda(body);
  return {
    success: true,
    game: "Sausage Man",
    id,
    name: data.confirmationFields.username,
  };
}

async function valo(id: number) {
  const body = `voucherPricePoint.id=973634&voucherPricePoint.price=56000&voucherPricePoint.variablePrice=0&user.userId=${id}&voucherTypeName=VALORANT&voucherTypeId=109&gvtId=139&shopLang=id_ID`;
  const data = await hitCoda(body);
  if (data.success === true) {
    return {
      success: true,
      game: "VALORANT",
      id,
      server: "Indonesia",
      name: data.confirmationFields.username,
    };
  } else if (data.errorCode === -200) {
    return {
      success: true,
      game: "VALORANT",
      id,
      name: id,
    };
  } else {
    return {
      success: false,
      message: "Not found",
    };
  }
}
