import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        require: false
    },
    explanation: {
        type: String,
        require: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imagePublicId: {
        type: String,
        required: false
    },  
    image: {
        type: String,
        required: false
    },
    likes: {
        type: Map,
        of: Boolean,
    },
    comments: [{
        coment: {
            type: String,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        isDelete: {
            type: Boolean,
            default: false
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    isDelete: {
        type: Boolean,
        default: false
    }
});

const Post = mongoose.model('Post', postSchema);

export default Post;