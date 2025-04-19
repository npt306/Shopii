import "../../../css/user/profile.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { EnvValue } from "../../../env-value/envValue";

interface ProfileProps {
  userId: number;
}

export const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const [formData, setFormData] = useState<{
    AccountId: number;
    Username: string;
    Email: string;
    PhoneNumber: string;
    Sex: boolean;
    DoB: string;
    Avatar: string | null;
  }>({
    AccountId: userId,
    Username: "username",
    Email: "user@example.com",
    PhoneNumber: "0987654321",
    Sex: false, // true = Male, false = Female
    DoB: "2/2/2222",
    Avatar: null,
  });

  const [changeForm, setChangeForm] = useState(false);
  const [changeAvatar, setChangeAvatar] = useState(false);
  const [avtFile, setAvtFile] = useState<File | null>(null); //Avatar upload

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await axios.get(
          `${EnvValue.API_GATEWAY_URL}/api/users/${userId}`
        );
        // console.log(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (files && files.length > 0) {
      const _file = files[0];
      setAvtFile(_file);
      // console.log();
      setFormData((prev) => ({
        ...prev,
        Avatar: URL.createObjectURL(files[0]),
      }));
      setChangeAvatar(true);
      return;
    }
    setChangeForm(true);

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "radio"
          ? value === "Nam"
          : type === "date"
          ? new Date(value).toISOString().split("T")[0]
          : value,
    }));
    // console.log(formData);
  };
  const checkValidForm = () => {
    console.log(formData);
    const { Username, Email, PhoneNumber, DoB } = formData;

    const usernamePattern = new RegExp("^[A-Za-z][A-Za-z0-9_.]{2,}$");
    if (!Username.match(usernamePattern)) {
      toast.error(
        "Tên đăng nhập phải bắt đầu bằng chữ cái và có ít nhất 3 ký tự."
      );
      return false;
    }

    const emailPattern = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$");
    if (!Email.match(emailPattern)) {
      toast.error("Email không hợp lệ.");
      return false;
    }

    const phonePattern = new RegExp("^(?:0|\\+84)?\\d{9,12}$");
    if (!PhoneNumber.match(phonePattern) && PhoneNumber !== "N/A") {
      toast.error("Số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };
  const handleSubmit = async () => {
    if (checkValidForm()) {
      try {
        // Send profile update request
        if (changeForm) {
          const response = await axios.post(
            `${EnvValue.API_GATEWAY_URL}/api/users/update-profile`,
            formData
          );
          if (response && response.data) {
            // Update localStorage with the new user data
            setChangeForm(false);
            const updatedUserProfile = {
              ...JSON.parse(localStorage.getItem("userProfile") || "{}"), // Get current profile
              accountId: formData.AccountId,
              email: formData.Email,
              username: formData.Username,
              avatar: formData.Avatar,
              dateOfBirth: formData.DoB,
              phoneNumber: formData.PhoneNumber,
              sex: formData.Sex,
              updatedAt: new Date().toISOString(),
            };

            localStorage.setItem(
              "userProfile",
              JSON.stringify(updatedUserProfile)
            );
          }
        }

        if (changeAvatar && avtFile) {
          const avatarFormData = new FormData();
          avatarFormData.append("file", avtFile);
          console.log(avatarFormData);
          const avatarResponse = await axios.post(
            `${EnvValue.API_GATEWAY_URL}/api/users/update-avatar/${userId}`,
            avatarFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          console.log(avatarResponse.data, "AVATARTTTTTTTT");
          const updatedUserProfile = {
            ...JSON.parse(localStorage.getItem("userProfile") || "{}"), // Get current profile
            avatar: avatarResponse.data,
          };
          localStorage.setItem(
            "userProfile",
            JSON.stringify(updatedUserProfile)
          );
          if (avatarResponse) setChangeAvatar(false);
        }

        setChangeForm(false);
        toast.success("Cập nhật hồ sơ thành công");
        // }
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Không thể cập nhật hồ sơ");
      }
    }
  };

  return (
    <div className="user-container" role="main">
      <div style={{ display: "contents" }}>
        <div className="pt-0 px-7.5 pb-2.5">
          <div className="border-b border-zinc-100 py-2.5">
            <h1 className="profile-title">Hồ sơ của tôi</h1>
            <div className="mt-2 text-neutral-600">
              Quản lý thông tin hồ sơ để bảo mật tài khoản
            </div>
          </div>
          <div className="pt-7 flex flex-row items-start">
            <form className="flex flex-1" onSubmit={handleSubmit}>
              <div className="flex flex-1">
                <div className="w-9/10 grid grid-cols-10 gap-4">
                  {/* UPDATE FORM */}
                  <input
                    type="number"
                    name="AccountId"
                    defaultValue={userId}
                    hidden
                  />
                  {/* Username */}
                  <div className="form-label py-3 pr-1 text-base col-span-3">
                    <label>Tên đăng nhập</label>
                  </div>
                  <div className="form-info-input pl-3 col-span-7">
                    <input
                      type="text"
                      name="Username"
                      className="form-input-enable text-base"
                      value={formData.Username || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* Email */}
                  <div className="form-label py-3 pr-1 text-base col-span-3">
                    <label>Email</label>
                  </div>
                  <div className="form-info-input pl-3 col-span-7">
                    <input
                      type="email"
                      name="Email"
                      pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                      className="form-input-enable bg-gray-200 text-base cursor-not-allowed"
                      value={formData.Email || ""}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                  {/* Phone number */}
                  <div className="form-label py-3 pr-1 text-base col-span-3">
                    <label>Số điện thoại</label>
                  </div>
                  <div className="form-info-input pl-3 col-span-7">
                    <input
                      type="text"
                      name="PhoneNumber"
                      className="form-input-enable text-base"
                      pattern="\d{9}"
                      value={formData.PhoneNumber || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* Sex */}
                  <div className="form-label py-3 pr-1 text-base col-span-3">
                    <label>Giới tính</label>
                  </div>
                  <div className="form-info-input pl-3 col-span-7">
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="Sex"
                          value="Nam"
                          checked={formData.Sex === true}
                          onChange={handleInputChange}
                          className="radio-input"
                        />
                        Nam
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="Sex"
                          value="Nữ"
                          checked={formData.Sex === false}
                          onChange={handleInputChange}
                          className="radio-input"
                        />
                        Nữ
                      </label>
                    </div>
                  </div>
                  {/* DoB */}
                  <div className="form-label py-3 pr-1 text-base col-span-3">
                    <label>Ngày sinh</label>
                  </div>
                  <div className="form-info-input pl-3 col-span-7">
                    <input
                      type="date"
                      name="DoB"
                      className="date-picker"
                      value={formData.DoB || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  {/* BUTTON */}
                  <div className="col-span-6"></div>
                  <div className="form-info-input pl-3 col-span-4">
                    <button
                      type="button"
                      className={`btn btn-solid-primary inline-flex ${
                        changeForm || changeAvatar
                          ? ""
                          : "!bg-gray-400 !cursor-not-allowed"
                      }`}
                      onClick={() => handleSubmit()}
                      disabled={!(changeForm || changeAvatar)}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>

              {/* Avatar Section */}
              <div className="avatar-container">
                <div className="flex flex-col items-center">
                  <div className="avatar-show">
                    <div
                      className="avatar border border-gray-200"
                      style={{
                        backgroundImage: `url(${ changeAvatar ? 
                          formData.Avatar :
                          "https://storage.googleapis.com/shopii-image/user_avatar/c4f96264-90f0-4dda-a6bb-ebe4b502a9a7_avatar_default.png"
                        })`,
                      }}
                    />
                  </div>
                  <label className="btn btn-light inline-flex cursor-pointer">
                    Chọn ảnh
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      name="Avatar"
                      onChange={handleInputChange}
                    />
                  </label>
                  <div className="block mt-3 text-neutral-400 text-sm leading-5">
                    <div>Dung lượng file tối đa 50 MB</div>
                    <div>Định dạng: .JPEG, .PNG</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
