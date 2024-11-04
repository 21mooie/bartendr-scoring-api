const {
    REPLIES_SCORE,
    LIKES_SCORE,
    DISLIKES_SCORE,
    DATE_TIME_CREATED_SCORE,
}                                  = process.env;

class Scorer {
    score(document) {
        let score = 0;
        const dayInMs = 86400000;
        score += +REPLIES_SCORE * document.updatedReplies;
        score += +LIKES_SCORE * document.updatedLikes;
        score += +DISLIKES_SCORE * document.updatedDislikes;
        score += Math.floor((new Date() - document.dateTimeCreated)/dayInMs)* +DATE_TIME_CREATED_SCORE;
        return score;
    }
}

module.exports = new Scorer();