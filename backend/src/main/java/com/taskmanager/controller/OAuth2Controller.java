package com.taskmanager.controller;

import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.OAuth2UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/oauth2")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OAuth2Controller {
    private final OAuth2UserService oAuth2UserService;
    private final UserRepository userRepository;

    @GetMapping("/callback/{provider}")
    public ResponseEntity<?> oauth2Callback(
            @PathVariable String provider,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        try {
            if (oauth2User == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "OAuth2 authentication failed"));
            }

            Map<String, Object> attributes = oauth2User.getAttributes();
            String oauth2Id = getOAuth2Id(provider, attributes);
            
            User user = userRepository.findByOauth2ProviderAndOauth2Id(provider, oauth2Id)
                    .orElseThrow(() -> new RuntimeException("User not found after OAuth2 authentication"));

            String token = oAuth2UserService.generateJwtToken(user);
            
            // Перенаправляем на frontend с токеном
            String frontendUrl = "http://localhost:3001/auth/callback?token=" + token + "&username=" + user.getUsername();
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl)
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "OAuth2 callback failed: " + e.getMessage()));
        }
    }

    @GetMapping("/login/{provider}")
    public ResponseEntity<?> oauth2Login(@PathVariable String provider) {
        // Spring Security автоматически обработает редирект на OAuth2 провайдера
        return ResponseEntity.ok(Map.of(
                "message", "Redirecting to " + provider + " for authentication",
                "redirectUrl", "/oauth2/authorization/" + provider
        ));
    }

    private String getOAuth2Id(String provider, Map<String, Object> attributes) {
        return switch (provider.toLowerCase()) {
            case "google" -> (String) attributes.get("sub");
            case "yandex" -> (String) attributes.get("id");
            default -> throw new IllegalArgumentException("Unsupported OAuth2 provider: " + provider);
        };
    }
}
