"use client";

import { useState } from "react";
import { Button, CloseButton } from "@/components/controls/Button";
import {
  Checkbox,
  Radio,
  TextInput,
  JoinInput,
} from "@/components/controls/Inputs";
import TextArea from "@/components/controls/TextArea";
import { Select } from "@/components/controls/Select";

function Headings({ type, children }: { type: string; children: string }) {
  if (type === "h1") {
    return <h1 className="font-bold text-xl">{children}</h1>;
  } else if (type === "h2") {
    return <h2 className="font-bold text-lg">{children}</h2>;
  } else if (type === "h3") {
    return <h3 className="font-bold text-md">{children}</h3>;
  }
}

export default function Designs() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [textarea, setTextarea] = useState("");
  const [select, setSelect] = useState("1");
  const [check, setCheck] = useState(false);

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");

  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();

  const [radio, setRadio] = useState("1");

  return (
    <main className="p-4 flex flex-col gap-y-4">
      <Headings type="h1">디자인 데모</Headings>
      <p>
        이 페이지는 쏘앳에 쓰일 디자인 컴포넌트들의 예시를 보여주는
        페이지입니다.
      </p>
      <Headings type="h2">1. 버튼</Headings>
      <Headings type="h3">1.1. 일반 버튼</Headings>
      <ul className="flex flex-row space-x-4">
        <li>
          <Button>일반 버튼</Button>
        </li>
        <li>
          <Button highlight>하이라이트 버튼</Button>
        </li>
        <li>
          <Button disabled>비활성화 버튼</Button>
        </li>
      </ul>
      <p>일반적으로 쓰일 버튼입니다.</p>
      <Headings type="h3">1.2. 작은 크기의 버튼</Headings>
      <ul className="flex flex-row space-x-4">
        <li>
          <Button size="small">작은 버튼</Button>
        </li>
        <li>
          <Button highlight size="small">
            하이라이트 작은 버튼
          </Button>
        </li>
        <li>
          <Button disabled size="small">
            비활성화 작은 버튼
          </Button>
        </li>
      </ul>
      <p>
        작은 크기의 버튼입니다. 인증 번호 발송과 같은 보조 기능을 위해 이 버튼이
        쓰일 수 있습니다.
      </p>
      <Headings type="h3">1.3. 전체 너비 버튼</Headings>
      <ul className="flex flex-col gap-y-2">
        <li>
          <Button size="full">전체 너비 버튼</Button>
        </li>
        <li>
          <Button highlight size="full">
            하이라이트 전체 너비 버튼
          </Button>
        </li>
        <li>
          <Button disabled size="full">
            비활성화 전체 너비 버튼
          </Button>
        </li>
      </ul>
      <p>
        전체 너비 버튼은 컨테이너의 너비에 따라 결정됩니다. 따라서, 다음과 같은
        레이아웃 또한 구성할 수 있습니다.
      </p>
      <ul className="flex w-full flex-row gap-x-2">
        <li className="flex-1">
          <Button size="full">아니오</Button>
        </li>
        <li className="flex-1">
          <Button size="full" highlight>
            예
          </Button>
        </li>
      </ul>
      <Headings type="h3">1.4. 링크 버튼</Headings>
      <p>
        버튼 컴포넌트에 <code>onClick</code> 대신 <code>href</code> 속성을
        사용하면, 하이퍼링크로 작동하는 버튼을 만들 수 있습니다.
      </p>
      <Button highlight href="https://example.com">
        https://example.com/
      </Button>
      <Headings type="h3">1.5. 닫기 버튼</Headings>
      <ul className="flex w-full flex-row gap-x-2">
        <li className="flex flex-col items-center">
          <span className="text-sm font-bold">닫기 기본</span>
          <CloseButton
            onClick={() => alert("버튼이 작동했습니다!")}
          ></CloseButton>
        </li>
        <li className="flex flex-col items-center">
          <span className="text-sm font-bold">닫기 hover</span>
          <CloseButton
            className="bg-close-btn-hover"
            onClick={() => alert("버튼이 작동했습니다!")}
          ></CloseButton>
        </li>
        <li className="flex flex-col items-center">
          <span className="text-sm font-bold">닫기 active</span>
          <CloseButton
            className="bg-close-btn-active"
            onClick={() => alert("버튼이 작동했습니다!")}
          ></CloseButton>
        </li>
      </ul>

      <Headings type="h2">2. 텍스트 입력 창</Headings>
      <p>
        텍스트 박스와 관련된 컴포넌트들입니다. 텍스트 박스에 커서를 위치했을 때
        표시되는 아웃라인은 스타일링을 위해 브라우저 기본 아웃라인을
        비활성화하였고, 대신 Tailwind CSS의 <code>ring</code> 옵션을
        사용했습니다.
      </p>
      <Headings type="h3">2.1. 텍스트 Input</Headings>
      <TextInput
        label="수직 레이블의 텍스트 박스"
        value={name}
        onChange={setName}
      />
      <TextInput
        label="수평 레이블의 텍스트 박스"
        align="h"
        value={name}
        onChange={setName}
      />
      <TextInput
        placeholder="레이블이 없는 텍스트 박스"
        value={name}
        onChange={setName}
      />
      <p>
        텍스트 Input 내부에 보조 버튼을 추가할 수 있습니다. 보조 버튼을 추가하는
        경우 보조 버튼과 <code>input</code> 태그를 포함하는 컨테이너가
        추가되므로, 마크업이 달라집니다.
      </p>
      <TextInput
        label="이메일"
        value={email}
        onChange={setEmail}
        type="email"
        align="h"
      >
        <Button size="small" onClick={() => alert("버튼이 작동했습니다!")}>
          인증 번호 발송
        </Button>
      </TextInput>
      <TextInput
        label="이메일"
        value={email}
        onChange={setEmail}
        type="email"
        align="v"
      >
        <Button size="small" onClick={() => alert("버튼이 작동했습니다!")}>
          인증 번호 발송
        </Button>
      </TextInput>
      <TextInput
        value={email}
        onChange={setEmail}
        type="email"
        align="h"
        placeholder="이메일"
      >
        <Button size="small" onClick={() => alert("버튼이 작동했습니다!")}>
          인증 번호 발송
        </Button>
      </TextInput>

      <Headings type="h3">2.1.2 텍스트 Input </Headings>
      <p>
        회원 가입과 관련된 텍스트 input 입니다. 입력한 값이 invalid 한경우
        텍스트 하단에 invalid 문구를 띄웁니다. invalid 문구가 나타나는 공간은
        기본적으로 비어있으며, 공간이 유지됩니다.
      </p>
      <JoinInput
        label="비밀번호"
        placeholder="8~24자의 영문, 숫자, 특수문자"
        type="password"
        onChange={setPassword}
        value={password}
      ></JoinInput>
      <p>
        invalid 할 때의 회원가입 input 입니다.
        <br />
        회원가입 텍스트 Input 내부에도 보조 버튼을 추가 할 수 있습니다.
      </p>
      <JoinInput label="이메일" type="email" onChange={setEmail} value={email}>
        <Button
          highlight={true}
          onClick={() => alert("버튼이 작동했습니다!")}
          size="small"
          className="mb-[5px]"
          disabled
        >
          인증 번호 받기
        </Button>
      </JoinInput>
      <p>valid 할 때의 회원가입 input 입니다</p>

      <JoinInput label="이메일" type="number" onChange={setEmail} value={email}>
        <Button
          highlight={true}
          onClick={() => alert("버튼이 작동했습니다!")}
          size="small"
          className="mb-[5px]"
        >
          인증 번호 받기
        </Button>
      </JoinInput>
      <JoinInput
        label="인증번호"
        placeholder="인증번호를 입력해주세요"
        type="text"
        onChange={setPassword}
        value={password}
      >
        <Button
          highlight={true}
          onClick={() => alert("버튼이 작동했습니다!")}
          size="small"
          className="mb-[5px]"
        >
          확인
        </Button>
      </JoinInput>

      <Headings type="h3">2.2. Textarea</Headings>
      <p>여러 줄을 입력할 수 있습니다.</p>
      <TextArea
        value={textarea}
        onChange={setTextarea}
        placeholder="여기에 텍스트를 입력"
      />
      <p>TextInput과 동일하게 레이블을 추가할 수 있습니다.</p>
      <TextArea
        label="여러 줄 입력"
        value={textarea}
        onChange={setTextarea}
        placeholder="여기에 텍스트를 입력"
      />

      <Headings type="h2">3. 셀렉트 박스</Headings>
      <p>
        셀렉트 박스입니다. 셀렉트 박스의 value는 string을 기준으로 받습니다.
      </p>
      <Select
        value={select}
        onChange={setSelect}
        options={[
          { value: "1", label: "1번" },
          { value: "2", label: "2번" },
          { value: "3", label: "3번" },
        ]}
      />

      <Select
        label="레이블이 있는 셀렉트 박스"
        value={select}
        onChange={setSelect}
        options={[
          { value: "1", label: "1번" },
          { value: "2", label: "2번" },
          { value: "3", label: "3번" },
        ]}
      />
      <ul className="grid grid-cols-3 grid-rows-1 w-full gap-x-2">
        <li>
          <Select
            value={year}
            onChange={setYear}
            options={Array.from({ length: 120 }, (_, i) => ({
              value: `${new Date().getFullYear() - i}`,
              label: `${new Date().getFullYear() - i}년`,
            }))}
          />
        </li>
        <li>
          <Select
            value={month}
            onChange={setMonth}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: `${i + 1}`,
              label: `${i + 1}월`,
            }))}
          />
        </li>
        <li>
          <Select
            value={day}
            onChange={setDay}
            options={Array.from({ length: lastDay }, (_, i) => ({
              value: `${i + 1}`,
              label: `${i + 1}일`,
            }))}
          />
        </li>
      </ul>
      <Headings type="h2">4. 체크박스</Headings>
      <Checkbox checked={check} onChange={setCheck}>
        <a href="https://example.com">이용 약관</a>에 동의합니다.
      </Checkbox>
      <Headings type="h2">5. 라디오 버튼</Headings>
      <p>여러 목록 중에서 하나의 아이템을 선택하는 버튼입니다.</p>
      <p>
        라디오 버튼의 <code>items</code> 속성은 배열로 받아, 각 아이템의{" "}
        <code>value</code>와 <code>label</code>을 받습니다.
      </p>
      <Radio
        checked={radio}
        onChange={setRadio}
        items={[
          { value: "radio1", label: "1번" },
          { value: "radio2", label: "2번" },
          { value: "radio3", label: "3번" },
        ]}
      />
    </main>
  );
}
