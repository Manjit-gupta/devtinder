const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        index: true
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value){
            
            if(!validator.isEmail(value)){
                 throw new Error(`Invalid email address: ${value}`);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error(`Password is not strong enough: ${value}`);
            }
        }
    },
    age: {
        type: Number,
    },
    gender:{
        type: String,
        enum:{
            values: ["Male", "Female", "Other"],
            message: `{VALUE} is not valid gender`
        },
        // validate(value){
        //     if(!['Male', 'Female', 'Other'].includes(value)){
        //         throw new Error("Gender must be Male, Female or Other");
        //     }
        // }
    },
    skills:{
        type: [String],
            validate: {
                validator: function(skills) {
                    // Max 10 skills
                    if (skills.length > 10) return false;
                    // No duplicates
                    const uniqueSkills = new Set(skills.map(s => s.trim().toLowerCase()));
                    return uniqueSkills.size === skills.length;
                },
                message: 'You can add up to 10 unique skills only.'
            }
    },
    endorsements: [{
        skill: { type: String, required: true },
        endorsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    bio:{
        type: String,
        default:" Hey there! I'm using DevTinder."
    },
    photoUrl:{
        type: String,
        default: "👦"
    },
    githubUrl: {
        type: String,
    },
    experienceYears: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
    },
    openToWork: {
        type: Boolean,
        default: false
    }
},
{ 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('profileCompleteness').get(function() {
    let score = 0;
    if (this.firstName) score += 10;
    if (this.lastName) score += 10;
    if (this.bio && this.bio !== " Hey there! I'm using DevTinder.") score += 15;
    if (this.photoUrl && this.photoUrl !== "👦") score += 20;
    if (this.skills && this.skills.length > 0) score += 15;
    if (this.githubUrl) score += 15;
    if (this.location) score += 10;
    if (this.experienceYears > 0) score += 5;
    
    // Cap at 100
    return Math.min(score, 100);
});

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({ userId: this._id }, process.env.jwt_secret, { expiresIn: "1h" });
    return token; 
}

userSchema.methods.validatePassword = async function(passwordInput) {
    const user = this;
    const passwordHash = user.password;
    const isMatch = await bcrypt.compare(passwordInput, passwordHash);
    return isMatch;
}

const User = mongoose.model('User', userSchema);

module.exports = User;