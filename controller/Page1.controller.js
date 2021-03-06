sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel'
    ],
    function(Controller, JSONModel) {
        "use strict";

        var db;
        var item;
        var PageController = Controller.extend("sap.m.sample.SemanticPage.Page", {

            onInit: function () {
                var _this = this;
                _this.getView().setModel(oModel);

                db = openDatabase('kayitdb', '1.0', 'ilkdb',  2 * 1024 * 1024);
                db.transaction(function(tx){
                    tx.executeSql('CREATE TABLE IF NOT EXISTS kullanici(id unique,ad,soyad,email)');                
                })
                _this.personBring();
            },
            change: function(){
                var _this=this;
                if(item==null){
                    _this.getView().byId('1').setText('Ekle');
                }
                else{
                   _this.getView().byId('1').setText('Güncelle');
               }
           },
           search:function(oEvent){
            var _this=this;
            var veri=oModel.getProperty(oEvent.oSource.oBindingContexts.undefined.sPath);
            oModel.setProperty("/veri",veri)
            item=veri["id"];
            var d1=veri["ad"];
            var d2=veri["soyad"];
            var d3=veri["email"];
            oModel.setProperty("/deger",d1);
            oModel.setProperty("/deger2",d2);
            oModel.setProperty("/deger3",d3);
            _this.change();
        },
        personSearch : function (oEvent){
            var _this = this;
            var id;          
            var s1=oModel.getProperty("/deger");
            var s2=oModel.getProperty("/deger2");
            var s3=oModel.getProperty("/deger3");

            if(item==null){
                id=s1.substring(0,3)+s2.substring(0,1)+Math.random(0,20);
            }
            else{
                var parcala=item.split(' ');
                var d1=parcala[0];
                id=d1;
            }
            db.transaction(function(tx){
                tx.executeSql('SELECT * FROM kullanici WHERE id=?',[id],function(ty,result){
                    if(result.rows.length>0){
                        db.transaction(function(tx){
                            tx.executeSql('UPDATE kullanici SET ad=?, soyad=?, email=? WHERE id=?',[s1,s2,s3,id],function(ty,result){
                                new sap.m.MessageToast.show("Veri Güncellendi");
                                item=null;
                                _this.personBring();
                                _this.change();
                            });
                        })
                    }
                    else
                    {
                        _this.personInsert(id,s1,s2,s3);
                    }
                });
            })
        },
        personInsert : function (id,ad,soyad,email) { 
            var _this=this;
            db.transaction(function(tx)
            {
               tx.executeSql('INSERT INTO kullanici(id,ad,soyad,email) VALUES(?,?,?,?)',
                [id,ad,soyad,email]); 
               new sap.m.MessageToast.show("Veri Eklendi");
               _this.personBring();
           })                    
        },
        personBring: function(){
            db.transaction(function(tx)
            {
                tx.executeSql('SELECT * FROM kullanici',[],function(ty,result){
                    var kulList = Object.assign([], result.rows)
                    oModel.setProperty("/kul", kulList);
                }); 
            }) 
        }, 
        go:function(oEvent) {
            var parameter=oEvent.getSource().data("param");
            var a=this.getView().byId('in').getValue();
            var b=this.getView().byId('in1').getValue();
            var c=this.getView().byId('in2').getValue();           
            if(a==""||b==""||c==""){
               new sap.m.MessageToast.show("Kullanıcı Giriş Yapınız");
            }
            else{        
                var yol =oEvent.getSource();
                var bthis = this;
                var oRouter = sap.ui.core.UIComponent.getRouterFor(bthis);
                var a=this.getView().byId('in').getValue();
                var json = [{
                    ad: oModel.oData.deger,
                    soyad: oModel.oData.deger2,
                    email: oModel.oData.deger3
                }]
                oModel.setProperty("/people", json);
                oRouter.navTo("calendar",{details : parameter});
            }
        }
    });
return PageController;
});