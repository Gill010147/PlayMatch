import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import MapPopupPage from "../pages/MapPopupPage";
import MyPage from "../pages/MyPage";
import CreateMatchPage from "../pages/CreateMatchPage";
import MatchesListPage from "../pages/matches/MatchesListPage";
import MatchDetailPage from "../pages/matches/MatchDetailPage";
import RecommendationsPlayersPage from "../pages/recommendations/RecommendationsPlayersPage";
import RecommendedPlayerDetailPage from "../pages/recommendations/RecommendedPlayerDetailPage";
import UserProfilePage from "../pages/profiles/UserProfilePage";
import EditMyProfilePage from "../pages/profiles/EditMyProfilePage";
import TeamProfilePage from "../pages/profiles/TeamProfilePage";
import EditTeamProfilePage from "../pages/profiles/EditTeamProfilePage";
import FacilityProfilePage from "../pages/profiles/FacilityProfilePage";
import ChatRoomsPage from "../pages/chat/ChatRoomsPage";
import ChatRoomPage from "../pages/chat/ChatRoomPage";
import FeedbackPage from "../pages/reviews/FeedbackPage";
import UserReviewsPage from "../pages/reviews/UserReviewsPage";
import TeamReviewsPage from "../pages/reviews/TeamReviewsPage";
import CreateTeamProfilePage from "../pages/profiles/CreateTeamProfilePage";
import GeneralFeedbackPage from "../pages/reviews/GeneralFeedbackPage"; // Renamed import
import VideoFeedbackListPage from "../pages/reviews/VideoFeedbackListPage";
import VideoFeedbackDetailPage from "../pages/reviews/VideoFeedbackDetailPage";
import VideoFeedbackUploadPage from "../pages/reviews/VideoFeedbackUploadPage";
import HeaderLogo from "./HeaderLogo";

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {/* Wrap non-home routes to always show header logo */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mappopup" element={<MapPopupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/create-match" element={<CreateMatchPage />} />
        {/* Matches */}
        <Route
          path="/matches"
          element={
            <>
              <HeaderLogo />
              <MatchesListPage />
            </>
          }
        />
        <Route
          path="/matches/:matchId"
          element={
            <>
              <HeaderLogo />
              <MatchDetailPage />
            </>
          }
        />
        {/* Recommendations */}
        <Route
          path="/recommendations/players"
          element={
            <>
              <HeaderLogo />
              <RecommendationsPlayersPage />
            </>
          }
        />
        <Route
          path="/recommendations/players/:playerIndex"
          element={
            <>
              <HeaderLogo />
              <RecommendedPlayerDetailPage />
            </>
          }
        />
        {/* Profiles */}
        <Route
          path="/profiles/users/:userId"
          element={
            <>
              <HeaderLogo />
              <UserProfilePage />
            </>
          }
        />
        <Route
          path="/profiles/users/me/edit"
          element={
            <>
              <HeaderLogo />
              <EditMyProfilePage />
            </>
          }
        />
        <Route
          path="/profiles/teams/:teamId"
          element={
            <>
              <HeaderLogo />
              <TeamProfilePage />
            </>
          }
        />
        <Route
          path="/profiles/teams/:teamId/edit"
          element={
            <>
              <HeaderLogo />
              <EditTeamProfilePage />
            </>
          }
        />
        <Route
          path="/profiles/teams/create"
          element={
            <>
              <HeaderLogo />
              <CreateTeamProfilePage />
            </>
          }
        />
        <Route
          path="/profiles/facilities/:facilityId"
          element={
            <>
              <HeaderLogo />
              <FacilityProfilePage />
            </>
          }
        />
        {/* Chat */}
        <Route
          path="/chat/rooms"
          element={
            <>
              <HeaderLogo />
              <ChatRoomsPage />
            </>
          }
        />
        <Route
          path="/chat/rooms/:roomId"
          element={
            <>
              <HeaderLogo />
              <ChatRoomPage />
            </>
          }
        />
        {/* Feedback */}
        <Route
          path="/feedback"
          element={
            <>
              <HeaderLogo />
              <GeneralFeedbackPage />
            </>
          }
        />
        <Route
          path="/feedback/videos"
          element={
            <>
              <HeaderLogo />
              <VideoFeedbackListPage />
            </>
          }
        />
        <Route
          path="/feedback/videos/:videoId"
          element={
            <>
              <HeaderLogo />
              <VideoFeedbackDetailPage />
            </>
          }
        />
        <Route
          path="/feedback/videos/upload"
          element={
            <>
              <HeaderLogo />
              <VideoFeedbackUploadPage />
            </>
          }
        />
        <Route
          path="/reviews/users/:userId"
          element={
            <>
              <HeaderLogo />
              <UserReviewsPage />
            </>
          }
        />
        <Route
          path="/reviews/teams/:teamId"
          element={
            <>
              <HeaderLogo />
              <TeamReviewsPage />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
