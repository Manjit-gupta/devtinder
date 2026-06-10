const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    techStack: {
        type: [String],
        validate: {
            validator: function(skills) {
                if (skills.length > 10) return false;
                const uniqueSkills = new Set(skills.map(s => s.trim().toLowerCase()));
                return uniqueSkills.size === skills.length;
            },
            message: 'You can add up to 10 unique tech stack skills only.'
        }
    },
    repoLink: {
        type: String,
        trim: true
    },
    liveLink: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
