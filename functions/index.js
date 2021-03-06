const functions = require('firebase-functions');
const axios = require('axios');

const articlesEndpoint = "https://dev.to/api/articles";

async function getPost(postId, pageNo = 1) {
    const { data } = axios.get(`${articlesEndpoint}/me/all?per_page=10&page=${pageNo}`,
        {
            headers: {
                "api-key": functions.config().dev.api_key
            }
        }
    );

    const post = data.find((i) => i.id === postId);

    if(!post){
        getPost(postId, pageNo + 1);
    }

    return post;
}

async function updatePost(postId){
    const { comments_count } = await getPost(postId);
    const data = {title: `This post has ${comments_count} comments`};

    const res = await axios.put(`${articlesEndpoint}/${postId}`, data, {
        headers: {
            "api-key": functions.config().dev.api_key,
        },
    });
    return res.data;
}

exports.updatePostTitle = functions.pubsub
    .schedule("every 3 minutes")
    .onRun(() => {
        const postId = functions.config().dev.post_id;
        return updatePost(postId);
    });
