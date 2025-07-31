import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudianry} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const resgisterUser = asyncHandler(async (req, res) => {
// get user details from frotend
//validation- not empty
//check if the user already exsists: username, email
//check for images, check for avatar
//upload them to cloudinary, avatar
//create user object - create entry in db 
//remove passowrd and refresh ttoken field from response 
//check for user creation 
//return res

const {fullName, email, password, username} = req.body;
console.log("email: ", email);

if(
    [fullName, email, password, username].some(field => field?.trim() === "")
){
    throw new ApiError(400, "All fields are required");
}

const existedUser = User.findOne({
    $or: [{username}, {email}]
})

if(existedUser){
    throw new ApiError(400, "User already exists with this username or email");
}

const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required");
}

const avatar = await uploadOnCloudianry(avatarLocalPath);
const coverImage = await uploadOnCloudianry(coverImageLocalPath);

if(!avatar){
    throw new ApiError(400, "Avatar file is required");
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
);

if(!createdUser){
    throw new ApiError(500, "User creation failed");
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
)

})

export { resgisterUser };