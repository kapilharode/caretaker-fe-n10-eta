import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserAddOutlined,
  FileAddOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { getProfiles } from "redux/userActions";
import secureAxios from "services/http";
import { defaultImage, toTitleCase } from "constants/constant";
import AddProfile from "./addProfile";
import AddReports from "./addReports";
import CommonCard from "common/card";
import TextInput from "common/input";
import OrangeButton from "common/button/index";
import PreLoader from "common/loader";
import "./index.scss";
import ViewReports from "./viewReport";

const Profiles = () => {
  const dispatch = useDispatch();
  const { userProfiles, loading, token } = useSelector(
    (state) => state.userReducer
  );
  const [addProfile, setAddProfile] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [requestDisease, setRequestDisease] = useState(false);
  const [addReports, setAddReports] = useState(false);
  const [viewReports, setViewReports] = useState(false);
  const [profile, setProfile] = useState([]);

  const closeProfile = () => {
    setAddProfile(false);
    setRequestDisease(false);
    setEditProfile(false);
    setAddReports(false);
    setViewReports(false);
  };

  const openRequest = () => {
    setRequestDisease(true);
  };
  const closeRequest = () => {
    setRequestDisease(false);
  };

  const viewProfile = (id) => {
    userProfiles.forEach((item) => {
      if (item._id === id) {
        setProfile(item);
      }
    });
  };

  const saveFile = (e) => {
    fetch(e.target.href, {
      method: "GET",
      headers: {},
    })
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "image.png");
          document.body.appendChild(link);
          link.click();
        });
      })
      .catch((err) => {
        throw err;
      });
  };

  const deleteProfile = () => {
    const { _id } = profile;
    const payload = { access_token: token, profile_id: _id };
    secureAxios.post("/delete_profile", payload).then((res) => {
      if (res.data.status) {
        dispatch(getProfiles(token));
        setProfile({});
      }
    });
  };

  useEffect(async () => {
    dispatch(getProfiles(token));
  }, []); //eslint-disable-line

  const { name, age, blood_group, gender, disease } =
    profile?.profile_details || "";
  const { qr_code, profile_photo } = profile || "";

  return (
    <>
      {loading ? (
        <div className="loading">
          <CommonCard>
            <PreLoader />
          </CommonCard>
        </div>
      ) : (
        <div className="profiles">
          <CommonCard>
            <div className="main-content">
              <div className="top-section">
                <div className="search-bar">
                  <TextInput placeholder="Search profile..." />
                  <SearchOutlined />
                </div>
                <div className="icons">
                  <UserAddOutlined onClick={() => setAddProfile(true)} />
                </div>
              </div>
              <div className="profile-content">
                {userProfiles &&
                  userProfiles.map((item) => {
                    const { name, age, gender } = item.profile_details;
                    const image = item.profile_photo;
                    return (
                      <div
                        className={
                          name === profile?.profile_details?.name
                            ? "profile-section active"
                            : "profile-section"
                        }
                        key={item._id}
                        onClick={() => viewProfile(item._id)}
                      >
                        <img src={image ? image : defaultImage} alt="member" />
                        <div className="info">
                          <p>
                            Name - {gender === "male" ? "Mr." : "Miss"}{" "}
                            {toTitleCase(name)}
                          </p>
                          <p>Age - {age} years</p>
                          <p>Gender - {toTitleCase(gender)}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CommonCard>
          <CommonCard>
            <div className="profile-detail">
              <div className="profile-icons">
                <FileAddOutlined onClick={() => setAddReports(true)} />
                <FileTextOutlined onClick={() => setViewReports(true)} />
                <EditOutlined onClick={() => setEditProfile(true)} />
                <DeleteOutlined onClick={deleteProfile} />
              </div>
              {profile && (
                <div className="details">
                  <img
                    src={profile_photo ? profile_photo : defaultImage}
                    alt="detail"
                  />
                  <div className="user-info">
                    <p>Name - {toTitleCase(name)}</p>
                    <p>Age - {age} years</p>
                    <p>Gender - {toTitleCase(gender)}</p>
                    <p>Blood group - {blood_group}</p>
                    <p>Diseases - {toTitleCase(disease)}</p>
                  </div>
                  <div className="qr-code">
                    <QrcodeOutlined />
                  </div>
                  <a href={qr_code} target="_blank" rel="noreferrer">
                    <OrangeButton
                      text="Download"
                      type="orange-button"
                      click={saveFile}
                    />
                  </a>
                </div>
              )}
            </div>
          </CommonCard>
          {addProfile && (
            <div className="profile-dialog">
              <AddProfile
                addProfile={addProfile}
                closeProfile={closeProfile}
                token={token}
                requestDisease={requestDisease}
                closeRequest={closeRequest}
                openRequest={openRequest}
              />
            </div>
          )}
          {editProfile && (
            <div className="profile-dialog">
              <AddProfile
                closeProfile={closeProfile}
                profile={profile}
                editProfile={editProfile}
                addProfile={addProfile}
              />
            </div>
          )}
          {addReports && (
            <AddReports closeProfile={closeProfile} profile={profile} />
          )}
          {viewReports && <ViewReports closeProfile={closeProfile} />}
        </div>
      )}
    </>
  );
};

export default Profiles;
