package com.taskmanager.service;

import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // ThreadLocal для хранения пользователя в рамках одного запроса
    private static final ThreadLocal<User> savedUser = new ThreadLocal<>();
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        
        // Сохраняем или обновляем пользователя
        User user = processOAuth2User(provider, oauth2User);
        savedUser.set(user); // Сохраняем в ThreadLocal
        
        return oauth2User;
    }

    private User processOAuth2User(String provider, OAuth2User oauth2User) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String oauth2Id = getOAuth2Id(provider, attributes);
        String email = getEmail(provider, attributes);
        String name = getName(provider, attributes);
        
        log.info("Processing OAuth2 user. Provider: {}, OAuth2Id: {}, Email: {}, Name: {}", provider, oauth2Id, email, name);
        
        User user = userRepository.findByOauth2ProviderAndOauth2Id(provider, oauth2Id)
                .orElseGet(() -> {
                    log.info("User not found by OAuth2Id, checking by email: {}", email);
                    // Проверяем, существует ли пользователь с таким email
                    User existingUser = userRepository.findByEmail(email).orElse(null);
                    if (existingUser != null) {
                        log.info("Found existing user by email, updating OAuth2 info");
                        // Обновляем существующего пользователя
                        existingUser.setOauth2Provider(provider);
                        existingUser.setOauth2Id(oauth2Id);
                        return existingUser;
                    }
                    
                    log.info("Creating new user for OAuth2");
                    // Создаем нового пользователя
                    User newUser = new User();
                    newUser.setOauth2Provider(provider);
                    newUser.setOauth2Id(oauth2Id);
                    newUser.setEmail(email);
                    newUser.setUsername(generateUsername(provider, attributes, email));
                    newUser.setPassword(null); // OAuth2 пользователи не имеют пароля
                    newUser.setRole(User.Role.USER);
                    
                    // Разбиваем имя на firstName и lastName
                    String[] nameParts = name.split(" ", 2);
                    if (nameParts.length > 0) {
                        newUser.setFirstName(nameParts[0]);
                    }
                    if (nameParts.length > 1) {
                        newUser.setLastName(nameParts[1]);
                    }
                    
                    return newUser;
                });
        
        User savedUser = userRepository.save(user);
        log.info("User saved/updated. ID: {}, Username: {}, OAuth2Id: {}", savedUser.getId(), savedUser.getUsername(), savedUser.getOauth2Id());
        return savedUser;
    }

    private String getOAuth2Id(String provider, Map<String, Object> attributes) {
        return switch (provider.toLowerCase()) {
            case "google" -> (String) attributes.get("sub");
            case "yandex" -> (String) attributes.get("id");
            default -> throw new IllegalArgumentException("Unsupported OAuth2 provider: " + provider);
        };
    }

    private String getEmail(String provider, Map<String, Object> attributes) {
        return switch (provider.toLowerCase()) {
            case "google" -> (String) attributes.get("email");
            case "yandex" -> (String) attributes.get("default_email");
            default -> throw new IllegalArgumentException("Unsupported OAuth2 provider: " + provider);
        };
    }

    private String getName(String provider, Map<String, Object> attributes) {
        return switch (provider.toLowerCase()) {
            case "google" -> (String) attributes.get("name");
            case "yandex" -> {
                String firstName = (String) attributes.get("first_name");
                String lastName = (String) attributes.get("last_name");
                if (firstName != null && lastName != null) {
                    yield firstName + " " + lastName;
                } else if (firstName != null) {
                    yield firstName;
                } else {
                    yield (String) attributes.get("login");
                }
            }
            default -> throw new IllegalArgumentException("Unsupported OAuth2 provider: " + provider);
        };
    }

    private String generateUsername(String provider, Map<String, Object> attributes, String email) {
        String baseUsername;
        
        // Пытаемся использовать login для Yandex или preferred_username для Google
        if ("yandex".equalsIgnoreCase(provider)) {
            String login = (String) attributes.get("login");
            if (login != null && !login.isEmpty()) {
                baseUsername = login;
            } else {
                // Если login нет, используем email
                baseUsername = email.split("@")[0];
            }
        } else if ("google".equalsIgnoreCase(provider)) {
            // Для Google используем email или preferred_username
            String preferredUsername = (String) attributes.get("preferred_username");
            if (preferredUsername != null && !preferredUsername.isEmpty()) {
                baseUsername = preferredUsername;
            } else {
                baseUsername = email.split("@")[0];
            }
        } else {
            baseUsername = email.split("@")[0];
        }
        
        // Очищаем username от недопустимых символов
        baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9._-]", "").toLowerCase();
        
        // Если username пустой после очистки, используем email
        if (baseUsername.isEmpty()) {
            baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "").toLowerCase();
        }
        
        String username = baseUsername;
        int counter = 1;
        
        // Проверяем уникальность и добавляем суффикс при необходимости
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }

    public String generateJwtToken(User user) {
        return jwtUtil.generateToken(user.getUsername());
    }

    public String generateJwtTokenFromOAuth2User(OAuth2User oauth2User, String provider) {
        Map<String, Object> attributes = oauth2User.getAttributes();
        String oauth2Id = getOAuth2Id(provider, attributes);
        
        User user = userRepository.findByOauth2ProviderAndOauth2Id(provider, oauth2Id)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 authentication"));
        
        return jwtUtil.generateToken(user.getUsername());
    }

    public User getUserFromOAuth2(OAuth2User oauth2User, String provider) {
        // Сначала пытаемся использовать сохраненного пользователя из loadUser
        User user = savedUser.get();
        if (user != null) {
            log.info("Using saved user from ThreadLocal: {}", user.getUsername());
            savedUser.remove(); // Очищаем ThreadLocal после использования
            return user;
        }
        
        // Если сохраненного пользователя нет, обрабатываем и сохраняем пользователя
        log.info("User not found in ThreadLocal, processing OAuth2 user directly");
        user = processOAuth2User(provider, oauth2User);
        
        // Проверяем, что пользователь действительно сохранен
        Map<String, Object> attributes = oauth2User.getAttributes();
        String oauth2Id = getOAuth2Id(provider, attributes);
        User foundUser = userRepository.findByOauth2ProviderAndOauth2Id(provider, oauth2Id)
                .orElseThrow(() -> {
                    log.error("OAuth2 User not found after processing. Provider: {}, OAuth2Id: {}", provider, oauth2Id);
                    log.error("Attributes: {}", attributes);
                    return new RuntimeException("User not found after OAuth2 authentication. Provider: " + provider + ", OAuth2Id: " + oauth2Id);
                });
        
        log.info("User found in database: ID={}, Username={}", foundUser.getId(), foundUser.getUsername());
        return foundUser;
    }
}
