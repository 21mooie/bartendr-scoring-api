const debug                                  = require('debug')('app:script');
const uuid                                   = require('uuid');

const DBService                              = require("./DBService");
const Scorer                                 = require("./Scorer");
const MinHeap                                = require("./MinHeap");

const {
    TIME_TO_WAIT,
    MAXIMUM_NUMBER_OF_CONTENT_TO_SCORE,
    DELAY_BETWEEN_CONTENT_SAVES,
}                                            = process.env;

async function run() {
    debug('Starting process...');
    const timeToWait = +TIME_TO_WAIT;
    const client = await DBService.getClient();

    function closeClientAndWait(client) {
        debug('Waiting to run scoring again ...');
        client.close()
    }
    
    scoreHeapifyAndAddDocuments(client, closeClientAndWait);
    setTimeout(run, timeToWait);
}

async function scoreHeapifyAndAddDocuments(client, closeClientAndWait) {
    const recentlyUpdatedCollection = client.db(DBService.getDBNameForDiscoverableContent()).collection(DBService.getCollectionNameForRecentlyUpdatedContent());
    let result = await recentlyUpdatedCollection.findOne();
    let maxToScore = +MAXIMUM_NUMBER_OF_CONTENT_TO_SCORE
    const minHeap = new MinHeap();
    while (result && maxToScore > 0) {
        result = await recentlyUpdatedCollection.findOne();
        if (!dryrun) {
            await recentlyUpdatedCollection.deleteOne(result);
        }
        //TODO: make function which reformats comment to be how I would like it to be for display
        delete result._id;
        const score = Scorer.score(result);
        result.score = score;

        minHeap.insert(result);

        maxToScore-=1;
    }

    const documents = [];
    async function emptyHeap() {
        // dateTimeAdded will be used to sort to get the newest documents added for explore page
        documents.push({
            ...minHeap.pop(),
            dateTimeAdded: new Date(),
        });
        if (minHeap.size() > 0) {
            setTimeout(emptyHeap, +DELAY_BETWEEN_CONTENT_SAVES);
        } else {
            debug('Documents to be added...');
            debug(documents);

            const exploreContentCollection = client.db(DBService.getDBNameForDiscoverableContent()).collection(DBService.getCollectionNameForExploreContent());
            await exploreContentCollection.insertMany(documents);

            const usersExploredCollection = client.db(DBService.getDBNameForDiscoverableContent()).collection(DBService.getCollectionNameForUsersOffset());
            const uid = uuid.v6();
            debug(`New masterContentGenerationId ${uid}`);
            await usersExploredCollection.updateOne(
                { isMaster: true },
                { $set: { masterContentGenerationId: uid, dateTimeUpdated: new Date() }},
            );

            closeClientAndWait(client);
        }
    }

    if (minHeap.size() > 0 && !dryrun)
        await emptyHeap();
    else 
        closeClientAndWait(client);
}

// may need to think of a way to programmatically remove older documents from explore_content once the collection gets too big
const dryrun = process.argv[2] === '--dryrun';
if(dryrun){
    debug('Dryrun running...');
}
run();