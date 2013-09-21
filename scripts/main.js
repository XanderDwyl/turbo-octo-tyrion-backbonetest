(function ($, BB, _) {
    $.fn.serializeObject = function() {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
          if (o[this.name] !== undefined) {
              if (!o[this.name].push) {
                  o[this.name] = [o[this.name]];
              }
              o[this.name].push(this.value || '');
          } else {
              o[this.name] = this.value || '';
          }
      });
      return o;
    };

    $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
      options.url = 'http://localhost:9090' + options.url;
    });

    $('#add_contact').tooltip();
    $('.edit').tooltip();

    var contactListView = Backbone.View.extend({
      el: '.page .table tbody',   
      events: {
        'click #add_contact': 'addContact',        
        'click .cancel'     : 'cancelEdit',
        'click .done'       : 'saveContact',
        'click .delete'     : 'deleteContact'
      },
      initialize: function () {
        this.input_name = $('#inputs input[name=fullname]');
        this.input_number = $('#inputs input[name=number]');
        this.input_username = $('#inputs input[name=username]');
        this.contacts_list = $(this.el);
      },
      addContact: function (evt) {
        var self = this;
        var person = new personModel({
          name: this.input_name.val(),
          number: this.input_number.val(),
          username: this.input_username.val()
        });

        //save entry
        person.save(person.toJSON(), {
          success: function (contact) {
            router.navigate('', {trigger: true});
            console.log();
            var addedContact = new personModel({
              name: contact.get('name'),
              number: contact.get('number'),
              username: contact.get('username'),
              id: contact.get('_id')
            });

            self.collection.add(addedContact);
            addedContact.set("position", self.collection.length);
            var view = new PersonView({model: addedContact});
            self.contacts_list.append(view.render().el);
          }
        });
      },
      deleteContact: function (evt) {
        evt.preventDefault();
        
        var self = this;
        var contacts = new personCollection();

        contacts.fetch({
          success: function (contactInfo) { 
            var delOk= 0;
            for (var i=0; i< contactInfo.models.length; i++){
              if (contactInfo.models[i].get('_id') === evt.target.id) { 
                person = new personModel({
                  name: contactInfo.models[i].get('name'),
                  number: contactInfo.models[i].get('number'),
                  username: contactInfo.models[i].get('username'),
                  id: contactInfo.models[i].get('_id')
                });         
                person.destroy();       
                delOk = 1;
              }
            }
            
            if(delOk) {
              self.$el.find('tr#' + evt.target.id).remove();
              alert("Delete successfully!");
            } else {
              alert("unknown contact");
            } 
          }
        });        
      },
      cancelEdit: function (evt) {
        // /*var i =0;
        // var cntChild = (this.contacts_list[0].childElementCount) - 1;
        // for(var i=cntChild;i>0;i--){
        //   this.contacts_list[0].children[i].remove();
        // }
        // */

        // evt.preventDefault();
  
        // this.$el.find('tr#' + evt.target.title).empty();        
        // var person = new personModel({
        //   name: 'test',
        //   number: 'dfd',
        //   username: 'testd'
        // });
        // person.set("position", (evt.target.title).replace(/[^0-9]+/ig,""));
        // var view = new PersonView({model: person});
        // this.$el.find('tr#' + evt.target.title).append(view.render().el.innerHTML);

      },
      render: function () {
        var self = this;
        var contacts = new personCollection();
        contacts.fetch({
          success: function (contactInfo) {         
            _.each(contactInfo.models, function(contact) {              
                var person = new personModel({
                  name: contact.get('name'),
                  number: contact.get('number'),
                  username: contact.get('username'),
                  id: contact.get('_id')               
                });                
                self.collection.add(person);
                person.set("position", self.collection.length);
                var view = new PersonView({model: person});
                self.contacts_list.append(view.render().el);
            });
          }
        })
      }
    });
    
    var contactEditView = Backbone.View.extend({
      el: '.page .table tbody',
      events: {
        'click .edit'     : 'render',
        'click .done'     : 'saveContact'
      },
      initialize: function () {
        this.input_name = $('#inputs input[name=fullname]');
        this.input_number = $('#inputs input[name=number]');
        this.input_username = $('#inputs input[name=username]');
        this.contacts_list = $(this.el);
      },
      render: function (evt) {
        evt.preventDefault();
        
        var self = this;
        var contacts = new personCollection();

        contacts.fetch({
          success: function (contactInfo) { 
            var editOk= 0;
            for (var i=0; i< contactInfo.models.length; i++){
              if (contactInfo.models[i].get('_id') === evt.target.id) { 
                person = new personModel({
                  name: contactInfo.models[i].get('name'),
                  number: contactInfo.models[i].get('number'),
                  username: contactInfo.models[i].get('username'),
                  id: contactInfo.models[i].get('_id')
                });                
                editOk = 1;
              }
            }
            
            if(editOk) {
              self.$el.find('tr#' + evt.target.id).empty();      // empty the field
    
              person.set("position", evt.target.title);
              var view = new editView({model: person});
              self.$el.find('tr#' + evt.target.id).append(view.render().el.innerHTML);
            } else {
              alert("unknown contact");
            } 
          }
        });        
      },
      saveContact: function (evt) {
        evt.preventDefault();
        var person = $(evt.currentTarget).serializeObject();

        this.input_name = $('input[name=editFullname]');
        this.input_number = $('input[name=editNumber]');
        this.input_username = $('input[name=editUsername]');
        
        updateContact = new personModel({
          name: this.input_name.val(),
          number: this.input_number.val(),
          username: this.input_username.val(),
          //_id: evt.target.id
        });

        this.collection.add(person);
        console.log(evt.target.id);

        updateContact.save({_id: evt.target.id}, {
          success: function (contact) {
            //router.navigate('', {trigger: true});
            alert(updateContact.toJSON());
          }
        });
      }
    });
    var PersonView = Backbone.View.extend({
        tagName: function () {
          return 'tr id=' + this.model.get('id');
        },                
        initialize: function() {
            
        },
        render: function() {
          var compiledTemplate = _.template($('#contact_template').html());
          this.$el.html(compiledTemplate(this.model.toJSON()));
          return this;
        }
    });

    var editView = Backbone.View.extend({
        render: function() {
          var compiledTemplate = _.template($('#editContact_template').html());
          this.$el.html(compiledTemplate(this.model.toJSON()));
          return this;
        }
    });

    var personModel = Backbone.Model.extend({ urlRoot: '/contacts'  });

    var personCollection = Backbone.Collection.extend({
      model: personModel,
      url: '/contacts'
    });

    var contactListView = new contactListView({collection: new personCollection()});
    var contactEditView = new contactEditView({collection: new personCollection()});

    var Router = Backbone.Router.extend({
        routes: {
          "": "home",
          "edit/:id": "editContact"
        }
    });

    var router = new Router;
    router.on('route:home', function() {
      contactListView.render();
    })
    router.on('route:editContact', function() {
      contactEditView.render();
    })

    Backbone.history.start();               
})(jQuery, Backbone, _)