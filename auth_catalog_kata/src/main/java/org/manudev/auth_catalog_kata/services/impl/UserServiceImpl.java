package org.manudev.auth_catalog_kata.services.impl;

import jakarta.transaction.Transactional;
import org.manudev.auth_catalog_kata.dto.UserRegisterDTO;
import org.manudev.auth_catalog_kata.entities.Role;
import org.manudev.auth_catalog_kata.entities.User;
import org.manudev.auth_catalog_kata.repository.IRoleRepository;
import org.manudev.auth_catalog_kata.repository.IUsersRepository;
import org.manudev.auth_catalog_kata.services.interfaces.IUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements IUserService {

    public UserServiceImpl(IUsersRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           IRoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    private final IUsersRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final IRoleRepository roleRepository;

    @Override
    @Transactional
    public User createUser(UserRegisterDTO userDto) {

        if (userRepository.findByEmail(userDto.email()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User newUser = User.builder()
                .name(userDto.name())
                .email(userDto.email())
                .password(passwordEncoder.encode(userDto.password()))
                .build();

        Set<Role> role = userDto.roles()
                .stream().map(roleName ->
                        roleRepository.findByName(roleName).orElseThrow(
                                () -> new RuntimeException("Role " + roleName + " not found")
                        )
                ).collect(Collectors.toSet());

        newUser.setRoles(role);

        return userRepository.save(newUser);
    }
}
