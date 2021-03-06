/**
 * Created by zhangfuhao on 2018/4/14.
 */

var express = require('express');
var router = express.Router();
var Article = require('../models/article');

router.post('/add', function (req, res, next) {
  Article.create({
    userId: req.body.userId,
    article_title: req.body.article_title,
    article_type: req.body.article_type,
    article_content: req.body.article_content
  }, function (err, doc) {
    if (err) {
      res.json({
        status: 2000,
        msg: err,
        result: '发布失败'
      })
    } else {
      res.json({
        status: 1000,
        msg: '',
        result: '发布成功'
      })
    }
  })
});

router.get('/detail', function (req, res, next) {
  Article.find({}, function (err, doc) {
    if (err) {
      res.json({
        status: 2000,
        msg: err,
        result: '查询失败'
      })
    } else {
      if (doc) {
        res.json({
          status: 1000,
          msg: doc,
          result: '查询成功'
        })
      } else {
        res.json({
          status: 1000,
          msg: '没有数据',
          result: '查询成功'
        })
      }
    }
  })
});

router.post('/getArticleList', function (req, res, next) {
  var page = Number(req.body.page);
  var pageSize = Number(req.body.pageSize);
  var skip = (page - 1) * pageSize;
  var keyWords = req.body.keyWords; //从URL中传来的 keyword参数
  var reg = new RegExp(keyWords, 'i'); //不区分大小写

  var _filter = {
    userId: req.body.userId,
    $or: [
      {article_title: {$regex: reg}}
    ]
  };

  Article.count(_filter, function (err, count) {
    if (!err) {
      var articleModel = Article.find(_filter).skip(skip).limit(pageSize);
      articleModel.sort({'meta.updateAt': 1});
      articleModel.exec(function (err, doc) {
        if (err) {
          res.json({
            status: 2000,
            msg: err,
            result: '查询失败'
          })
        } else {
          res.json({
            status: 1000,
            msg: '查询成功',
            result: doc,
            total: count
          })
        }
      })
    } else {
      res.json({
        status: 2000,
        msg: err,
        result: ''
      })
    }
  });
});

router.get('/getArticleDetail', function (req, res, next) {
  var params = {
    _id: req.query.article_id
  };
  Article.findOne(params, function (err, doc) {
    if (err) {
      res.json({
        status: 2001,
        msg: err,
        result: '查询失败'
      })
    } else {
      if (doc) {
        doc.article_count += 1;
        doc.save(function (err1, doc1) {
          if (err1) {
            res.json({
              status: 2002,
              msg: err1,
              result: '查询失败'
            })
          } else {
            if (doc1) {
              res.json({
                status: 1000,
                msg: doc1,
                result: '查询成功'
              })
            }
          }
        });
      } else {
        res.json({
          status: 1000,
          msg: '没有数据',
          result: '查询成功'
        })
      }
    }
  })
});

router.post('/articleEdit', function (req, res, next) {
  var params = {
    article_title: req.body.article_title,
    article_type: req.body.article_type,
    article_content: req.body.article_content
  };
  Article.update({_id: req.body.article_id}, params, function (err, doc) {
    if (err) {
      res.json({
        status: 2001,
        msg: err,
        result: '编辑失败'
      })
    } else {
      res.json({
        status: 1000,
        msg: '',
        result: '修改成功'
      })
    }
  })
});

router.post('/delete', function (req, res, next) {
  Article.deleteOne({_id: req.body.article_id}, function (err) {
    if (err) {
      res.json({
        status: 2000,
        msg: err,
        result: '删除失败'
      })
    } else {
      res.json({
        status: 1000,
        msg: '',
        result: '删除成功'
      })
    }
  })
});

module.exports = router;


