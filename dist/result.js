'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = require('path'),
    join = _require.join,
    resolve = _require.resolve;

var _require2 = require('fs'),
    readFileSync = _require2.readFileSync,
    existsSync = _require2.existsSync;

var _require3 = require('./getFrameworkCDNUrl'),
    getNativeRendererUrl = _require3.getNativeRendererUrl,
    FRAMEWORK_VERSION = _require3.FRAMEWORK_VERSION;

var EXTERNAL_PAGE_URL_REG = /^https?:\/\//;
var DEFAULT_CONFIG = {
  /**
   * Native appType for setting container type
   */
  appType: 'webview',
  /**
   * Native SDK Version means API level
   * if not satisfied, will notify upgrade
   * for users. must be a typeof string.
   */
  sdkVersion: '2'
};

/**
 * Get configuration for app.
 */
var getAppConfig = exports.getAppConfig = function getAppConfig(projectDir, opts) {
  var manifestFilePath = join(projectDir, 'manifest.json');
  var appDotJSONFilePath = join(projectDir, 'app.json');
  var appJSON = Object.assign({}, DEFAULT_CONFIG);

  if (existsSync(manifestFilePath)) {
    Object.assign(appJSON, readJSONSync(manifestFilePath));
  } else if (existsSync(appDotJSONFilePath)) {
    Object.assign(appJSON, readJSONSync(appDotJSONFilePath));
  } else {
    throw new Error('不存在以下文件: app.json | manifest.json');
  }

  var nativeRendererUrl = getNativeRendererUrl(appJSON.frameworkVersion || FRAMEWORK_VERSION);

  var pages = [];
  var homepage = 'index'; // default homepage
  if (Array.isArray(appJSON.pages)) {
    for (var i = 0; i < appJSON.pages.length; i++) {
      var pageName = appJSON.pages[i];

      if (i === 0) homepage = pageName;

      var pageUrl = void 0;

      if (EXTERNAL_PAGE_URL_REG.test(pageName)) {
        pageUrl = pageName;
      } else if (opts && opts.pageUrl) {
        pageUrl = opts.pageUrl;
      } else {
        pageUrl = nativeRendererUrl;
      }

      var pageConfig = {
        pageName: pageName,
        pageUrl: pageUrl
      };
      // merge page config json
      var independentPageConfigPath = resolve(projectDir, pageName + '.json');
      if (existsSync(independentPageConfigPath)) {
        Object.assign(pageConfig, JSON.parse(readFileSync(independentPageConfigPath)));
      }

      pages.push(pageConfig);
    }
  } else if (_typeof(appJSON.pages) === 'object') {
    var pageKeys = Object.keys(appJSON.pages);
    for (var _i = 0; _i < pageKeys.length; _i++) {
      var _pageName = pageKeys[_i];
      var pagePath = appJSON.pages[_pageName];

      if (_i === 0) homepage = _pageName;

      var _pageUrl = void 0;

      if (EXTERNAL_PAGE_URL_REG.test(_pageName)) {
        _pageUrl = _pageName;
      } else if (opts && opts.pageUrl) {
        _pageUrl = opts.pageUrl;
      } else {
        _pageUrl = nativeRendererUrl;
      }

      var _pageConfig = {
        pageName: _pageName,
        pagePath: pagePath,
        pageUrl: _pageUrl
      };
      // Merge page config json
      var _independentPageConfigPath = resolve(projectDir, pagePath + '.json');
      if (existsSync(_independentPageConfigPath)) {
        Object.assign(_pageConfig, JSON.parse(readFileSync(_independentPageConfigPath)));
      }

      pages.push(_pageConfig);
    }
  }

  var result = Object.assign({}, appJSON, {
    pages: pages,
    homepage: homepage
  });

  var tabBar = {};
  if (appJSON.tabBar) {
    Object.assign(tabBar, appJSON.tabBar);
  }

  if (tabBar.textColor) {
    tabBar.color = tabBar.textColor;
    delete tabBar.textColor;
  }

  if (Array.isArray(tabBar.items)) {
    tabBar.list = tabBar.items.map(function (item) {
      return {
        pageName: item.pagePath,
        text: item.name,
        iconPath: item.icon,
        selectedIconPath: item.activeIcon
      };
    });
    delete tabBar.items;
  }

  if (appJSON.window) {
    result.window = appJSON.window;
  }

  // h5Pages 指定 webview 的白名单
  if (appJSON.h5Pages) {
    result.h5Pages = appJSON.h5Pages;
  }

  result.tabBar = tabBar;

  return result;
};

/**
 * Get JS Object from filename.
 */
function readJSONSync(filename) {
  return JSON.parse(readFileSync(filename, 'utf-8'));
}

/**
 * Get list of page names.
 */
exports.getPages = function getPages(projectDir) {
  return getAppConfig(projectDir).pages;
};