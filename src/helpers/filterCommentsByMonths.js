
const filterCommentsByMonths = (posts, monthsLimit) => {
    if (!monthsLimit || isNaN(monthsLimit)) return posts;

    const limitDate = new Date();
    limitDate.setMonth(limitDate.getMonth() - parseInt(monthsLimit));

    return posts.map(post => {
        if (!post.comments || !post.comments.length) return post;

        const filteredComments = post.comments.filter(comment => {
            const commentDate = new Date(comment.createdAt);
            return commentDate >= limitDate;
        });

        return {
            ...post,
            comments: filteredComments
        };
    });
};

module.exports = { filterCommentsByMonths };