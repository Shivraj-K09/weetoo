// Constants for Naver OAuth
export const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!;
export const NAVER_REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback/naver`;
export const NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
export const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
export const NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me";

// Function to generate the Naver OAuth URL
export function getNaverOAuthURL() {
  // Generate a random state
  const state = crypto.randomUUID();

  // Store the state in localStorage for verification
  localStorage.setItem("naver_oauth_state", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: NAVER_CLIENT_ID,
    redirect_uri: NAVER_REDIRECT_URI,
    state: state,
  });

  return `${NAVER_AUTH_URL}?${params.toString()}`;
}

// Types for Naver responses
export interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface NaverUserResponse {
  resultcode: string;
  message: string;
  response: {
    id: string;
    nickname: string;
    name: string;
    email: string;
    gender: string;
    age: string;
    birthday: string;
    profile_image: string;
  };
}
