import { addFile } from "@/redux/slices/enrollSlice";
import { EditorToolbarProps, Level } from "@/types/editor";
import { getImageURLIndexedDB, saveImageIndexedDB } from "@/utils/Images";
import { ChainedCommands } from "@tiptap/react";
import React from "react";
import { useDispatch } from "react-redux";

export default function Toolbar({
  editor,
  headingButtons,
  formattingButtons,
  imageUpload,
  imageURL,
  handleImageURLUploadModal,
  HTMLEditModeButton,
  handleEditMode,
}: EditorToolbarProps) {
  const dispatch = useDispatch();

  const handleEditorHeadingOnClick = (level: Level) => {
    if (!editor) {
      return;
    }
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const handleEditorFormatButtonOnClick = (type: string) => {
    if (!editor) {
      return;
    }
    const command = `toggle${type}` as keyof ChainedCommands;
    const chain = editor.chain().focus();

    if (type)
      if (typeof chain[command] === "function") {
        (chain[command] as () => ChainedCommands)().run();
      }
    editor.chain().focus().toggleHeading({ level: 1 });
  };

  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files;
    if (!file || file.length === 0) return;

    try {
      const fileId = await saveImageIndexedDB(file[0]);
      const imageUrl = await getImageURLIndexedDB(fileId);
      if (editor) {
        dispatch(addFile(fileId));
        editor
          .chain()
          .focus()
          .insertContent({
            type: "customImage",
            attrs: { src: imageUrl, key: fileId },
          })
          .run();
        //setImage 내 없는 속성으로, key: fileId 제거
      }
    } catch (err) {
      console.error("이미지 업로드에 실패했습니다.", err);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  const handleUploadImageURL = () => {
    handleImageURLUploadModal(true);
  };

  return (
    <div className="flex flex-wrap">
      {headingButtons.map(({ type, label, icon: Icon, level }, index) => {
        const isActive = editor?.isActive(type, { level });
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleEditorHeadingOnClick(level as Level)}
            aria-label={label}
            className={`p-2 m-1 border rounded ${
              isActive ? "bg-gray-500 text-white" : "bg-transparent"
            }`}
          >
            <Icon />
          </button>
        );
      })}

      {formattingButtons.map(({ type, label, icon: Icon }, index) => {
        const isActive = editor?.isActive(
          type[0].toLowerCase() + type.slice(1)
        );
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleEditorFormatButtonOnClick(type)}
            aria-label={label}
            className={`p-2 m-1 border rounded ${
              isActive ? "bg-gray-500 text-white" : "bg-transparent"
            }`}
          >
            <Icon />
          </button>
        );
      })}
      <button
        type="button"
        onClick={handleEditMode}
        aria-label={HTMLEditModeButton.label}
        className="p-2 m-1 border rounded"
      >
        {<HTMLEditModeButton.icon />}
      </button>
      <label className="p-2 m-1 border rounded">
        {<imageUpload.icon />}
        <input
          type="file"
          className="sr-only"
          onChange={handleImageFileUpload}
        />
      </label>
      <button
        type="button"
        onClick={handleUploadImageURL}
        aria-label={imageURL.label}
        className="p-2 m-1 border rounded"
      >
        {<imageURL.icon />}
      </button>
    </div>
  );
}
