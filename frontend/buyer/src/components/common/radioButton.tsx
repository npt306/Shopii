export const RadioButton = ({ checked, onChange }: any) => {
  return (
    <div
      className={`stardust-radio ${checked ? "stardust-radio--checked" : ""}`}
      role="radio"
      onClick={onChange}
    >
      <div className="stardust-radio-button">
        <div className="stardust-radio-button__outer-circle">
          <div className="stardust-radio-button__inner-circle" />
        </div>
      </div>
    </div>
  );
};
