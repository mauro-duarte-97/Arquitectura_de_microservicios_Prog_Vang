package com.tp.gestion;

public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private long expiresInMinutes;
    private UserResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String accessToken, long expiresInMinutes, UserResponse user) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresInMinutes = expiresInMinutes;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresInMinutes() {
        return expiresInMinutes;
    }

    public void setExpiresInMinutes(long expiresInMinutes) {
        this.expiresInMinutes = expiresInMinutes;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
