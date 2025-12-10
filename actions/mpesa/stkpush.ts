"use server";


import dbConnect from "@/db/dbConnect";
import { isValidKenyanPhoneNumber, normalizeKenyanPhoneNumber } from "@/utils/kenyanphone";
import axios from "axios";

interface Params {
  mpesa_number: string;
  amount: string;
}

export const sendStkPush = async (body: Params) => {
  const validMpesaPhone = isValidKenyanPhoneNumber(body.mpesa_number);

  if (!validMpesaPhone) {
    return { error: "Invalid mpesa number" };
  }

  try {
    await dbConnect();

    let amount = parseInt(body.amount);

    //generate token
    const auth: string = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const resp = await axios.get(
      "https://api.safaricom.co.ke/oauth/v2/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    );

    const token = resp.data.access_token;
    const formattedPhone = normalizeKenyanPhoneNumber(body.mpesa_number);

    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password: string = Buffer.from(
      process.env.MPESA_PAYBILL! + process.env.MPESA_PASSKEY + timestamp
    ).toString("base64");

    const newBody = {
      mpesa_number: body.mpesa_number,
    };

    const jsonString = JSON.stringify(newBody);

    const urlEncodedString = encodeURIComponent(jsonString);

    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_PAYBILL,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_PARTY_B,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.MPESA_CALLBACK_URL}?jsonData=${urlEncodedString}`,
        AccountReference: process.env.MPESA_ACCOUNT_NUMBER,
        TransactionDesc: "ibysean",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { data: response.data };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error)
      return { error: error.message };
    }

    console.log(error)
    return { error: "something wrong happened" };
  }
};