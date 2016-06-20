#native-offline-h5
Native app load offline h5 resources by small package.

##proxy_pass:
+ http://www.nowamagic.net/academy/detail/1226280

##demo url:
+ http://h5app-consumer.zaijiadd.com/module-template/index.html

##preview dist:
![dist preview](https://github.com/afeiship/native-offline-h5/blob/master/snapshot/pacakge-size.jpg)

##resources:
+ http://zeptojs.com/
+ http://cn.vuejs.org/
+ http://ionicons.com/

##get start:
+ npm install && bower install
+ npm install yo afeiship/generator-native-offline-h5 -g

##usage:
+ create a new module && gulp serve:
  - yo native-offline-h5
  - cd <%= module_dir %>
  - gulp
+ publish your project
  - cd <%= module_dir %>
  - gulp publish
  - your dist package file: dist-module-packages/<%= module_dir %>.tar.gz

##issues:
* [x] Yeoman generator `afeiship/generator-native-offline-h5`
* [ ] Bower merge to one package
* [ ] All modules need to modules directory


