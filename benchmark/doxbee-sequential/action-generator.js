global.useAction = true;
var Action = require('action-js');
require('../lib/fakesP');

var actionFn = Action.co(function* upload(stream, idOrPath, tag, done) {
    try{
        var tx = db.begin();
        var blob = blobManager.create(account);
        var blobId = yield blob.put(stream);
        var file = yield self.byUuidOrPath(idOrPath).get();

        var previousId = file ? file.version : null;
        version = {
            userAccountId: userAccount.id,
            date: new Date(),
            blobId: blobId,
            creatorId: userAccount.id,
            previousId: previousId,
        };
        version.id = Version.createHash(version);
        yield Version.insert(version).execWithin(tx);
        if (!file) {
            var splitPath = idOrPath.split('/');
            var fileName = splitPath[splitPath.length - 1];
            file = {
                id: uuid.v1(),
                userAccountId: userAccount.id,
                name: fileName,
                version: version.id
            }
            var query = yield self.createQuery(idOrPath, file);
            yield query.execWithin(tx);
        }
        yield FileVersion.insert({fileId: file.id, versionId: version.id})
            .execWithin(tx);
        yield File.whereUpdate({id: file.id}, {version: version.id})
            .execWithin(tx);

         tx.commit();
         return done();
    }
    catch(e){
         tx.rollback();
         return done(data);
    }

});

module.exports = function(stream, idOrPath, tag, done){
    actionFn(stream, idOrPath, tag, done).go()
}

