const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors')
const axios = require('axios').default;
var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({store: 'memory', max: 100, ttl: 10/*seconds*/});
var ttl = 100;
 
module.exports = app;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('client'));

const git_repo_url = "https://registry.npmjs.org/";
const getRepoURL = (repoName) => `${git_repo_url}${repoName}/latest`;

const callGitRegistry = (repoName, cb) => {
  console.log('repoName:', repoName);
  axios.get(getRepoURL(repoName))
  .then(result => {
    const dependencies = result.data.dependencies || {};
    cb(null, {name: repoName, dependencies});
  })
  .catch(err => cb(null, {err}));
}

const getRepoInfo = (repoName, res) => {
  const key = 'repo_' + repoName;

  memoryCache.wrap(key, cb => {
    callGitRegistry(repoName, cb);
  }, {ttl: ttl}, (err, repo) => {
    memoryCache.wrap(key, cb => {
      callGitRegistry(repoName, cb);
    }, (err, repo) => {
      if(repo.err) {
        res.send('not found');
      } else {
        console.log('cached', repo.name);
        res.send(repo.dependencies);
      }
    });
  });
};

app.get(
  '/:repoName',
  (req, res) => {
    const repoName = req.params.repoName;
    getRepoInfo(repoName, res);
  }
);

app.get(
  '/',
  (req, res) => {

    var repoName = 'express';
    var key = 'repo_' + repoName;
 
    memoryCache.wrap(key, cb => {
      getRepoInfo(repoName, cb);
    }, {ttl: ttl}, (err, repo) => {
      memoryCache.wrap(key, cb => {
        getRepoInfo(repoName, cb);
      }, (err, repo) => {
          console.log('cached', repo.name);
          res.send(repo.dependencies);
      });
    });
  }
);

// var port = process.env.PORT || 4040;
// app.listen(port);
// console.log("Listening on port " + port);


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})