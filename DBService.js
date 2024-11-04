const { MongoClient }               = require('mongodb');
const { MONGO_URL }                 = process.env;

class DBService {
    constructor() {
        this.client = null;
    }

    async connect() {
        return new MongoClient(MONGO_URL);
    }

    async getClient() {
        if (!this.client) {
            this.client = await this.connect();
        }
        return this.client;
    }

    getDBNameForDiscoverableContent() {
        return 'discoverable_content';
    }

    getCollectionNameForRecentlyUpdatedContent() {
        return 'recently_updated';
    }

    getCollectionNameForExploreContent() {
        return 'explore_content';
    }

    async close() {
        this.client.close();
        this.client = null;
    }

    convertCommentIdToObjectId(commentId) {
        return mongodb.ObjectId(commentId);
    }

    createObjectId() {
        return mongodb.ObjectId();
    }

    static getInstance() {
        if (!this.instance) {
          this.instance = new DBService();
        }
        return this.instance;
    }
}

module.exports = DBService.getInstance();
