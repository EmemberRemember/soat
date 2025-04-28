import { Button } from "@/components/controls/Button";
import TheaterSeatManager from "@/components/seats/TheaterLayoutManager";

export default function SeatsGeneratorDemo() {
  return (
    <>
      <TheaterSeatManager />
      <Button href="/demo/seats/selector">좌석 선택 데모로 이동</Button>
    </>
  );
}
