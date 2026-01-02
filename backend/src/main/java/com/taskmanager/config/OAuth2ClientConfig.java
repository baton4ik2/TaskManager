package com.taskmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

@Configuration
public class OAuth2ClientConfig {

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(
                yandexClientRegistration(),
                googleClientRegistration()
        );
    }

    private ClientRegistration yandexClientRegistration() {
        String clientId = System.getenv("YANDEX_CLIENT_ID");
        String clientSecret = System.getenv("YANDEX_CLIENT_SECRET");
        
        if (clientId == null || clientId.isEmpty() || clientId.equals("your-yandex-client-id")) {
            throw new IllegalStateException("YANDEX_CLIENT_ID environment variable is required");
        }
        if (clientSecret == null || clientSecret.isEmpty() || clientSecret.equals("your-yandex-client-secret")) {
            throw new IllegalStateException("YANDEX_CLIENT_SECRET environment variable is required");
        }

        return ClientRegistration.withRegistrationId("yandex")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:8082/api/login/oauth2/code/yandex")
                .scope("login:info", "login:email")
                .authorizationUri("https://oauth.yandex.ru/authorize")
                .tokenUri("https://oauth.yandex.ru/token")
                .userInfoUri("https://login.yandex.ru/info")
                .userNameAttributeName("id")
                .clientName("Yandex")
                .build();
    }

    private ClientRegistration googleClientRegistration() {
        String clientId = System.getenv("GOOGLE_CLIENT_ID");
        String clientSecret = System.getenv("GOOGLE_CLIENT_SECRET");
        
        if (clientId == null || clientId.isEmpty() || clientId.equals("your-google-client-id")) {
            throw new IllegalStateException("GOOGLE_CLIENT_ID environment variable is required");
        }
        if (clientSecret == null || clientSecret.isEmpty() || clientSecret.equals("your-google-client-secret")) {
            throw new IllegalStateException("GOOGLE_CLIENT_SECRET environment variable is required");
        }

        return ClientRegistration.withRegistrationId("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost:8082/api/login/oauth2/code/google")
                .scope("openid", "profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .clientName("Google")
                .build();
    }
}

