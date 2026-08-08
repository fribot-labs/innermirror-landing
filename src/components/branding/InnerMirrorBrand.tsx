import logo from "../../../assets/logo/IM_LOGO.png";

import "./InnerMirrorBrand.css";

export function InnerMirrorBrand() {
  return (
    <div
      className="innermirror-brand"
      aria-label="InnerMirror"
    >
      <img
        src={logo}
        alt="InnerMirror"
        className="innermirror-brand__logo"
      />
    </div>
  );
}