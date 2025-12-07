package org.manudev.auth_catalog_kata.services.interfaces;

import org.manudev.auth_catalog_kata.dto.UserRegisterDTO;
import org.manudev.auth_catalog_kata.entities.User;

public interface IUserService {

    User createUser(UserRegisterDTO user);
}
