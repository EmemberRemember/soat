import QRCode from "react-qr-code";

export function tossUrl({
  amount,
  bank,
  accountNo,
  msg,
}: {
  amount: number;
  bank: string;
  accountNo: string;
  msg: string;
}) {
  return `supertoss://send?amount=${amount}&bank=${bank}&accountNo=${accountNo.replaceAll("-", "")}&msg=${msg}&origin=qr`;
}

export function TossQRCode({
  amount,
  bank,
  accountNo,
  msg,
  className,
}: {
  amount: number;
  bank: string;
  accountNo: string;
  msg: string;
  className?: string;
}) {
  const tossUrlValue = tossUrl({
    amount,
    bank,
    accountNo,
    msg,
  });
  return (
    <>
      <QRCode
        value={encodeURI(tossUrlValue)}
        size={256}
        style={{ width: "100%" }}
        viewBox={`0 0 256 256`}
        className={className ? className : ""}
      />
    </>
  );
}
