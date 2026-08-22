import userService from './user.service.js';

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const result = await userService.loginUser(
      username,
      password,
    )

    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    })
  } catch (error) {
    next(error)
  }
}

const logoutUser = async (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  res.status(200).json({
    success: true,
    message: "Logout successful",
  })
}

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(
      req.user._id,
    )

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(
      req.params.id,
      req.body.role
    );

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export {
  loginUser,
  logoutUser,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  getMe,
};