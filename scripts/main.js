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

    var contactListView = Backbone.View.extend({
      el: '.page .table tbody',   
      events: {
        'click #add_contact': 'addPerson'
      },
      initialize: function () {
        this.input_name = $('#inputs input[name=fullname]');
        this.input_number = $('#inputs input[name=number]');
        this.input_username = $('#inputs input[name=username]');
        this.contacts_list = $(this.el);
      },
      addPerson: function (evt) {
        var person = new personModel({
          name: this.input_name.val(),
          number: this.input_number.val(),
          username: this.input_username.val()
        });

        this.collection.add(person);
        person.set("position", this.collection.length);

        var view = new PersonView({model: person});
        this.contacts_list.append(view.render().el); 

        //save entry
        person.save(person.toJSON(), {
          success: function (contact) {
            router.navigate('', {trigger: true});
          }
        }); 

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
                  username: contact.get('username')
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
    
    var personModel = Backbone.Model.extend({
      urlRoot: '/contacts'
    });

    var personCollection = Backbone.Collection.extend({
      model: personModel,
      url: '/contacts'
    });

    var PersonView = Backbone.View.extend({
        tagName: 'tr',                
        initialize: function() {
            
        },
        render: function() {
          var compiledTemplate = _.template($('#contact_template').html());
          this.$el.html(compiledTemplate(this.model.toJSON()));
          return this;
        }

    });

    var contactListView = new contactListView({collection: new personCollection()});

    var Router = Backbone.Router.extend({
        routes: {
          "": "home", 
          "edit/:id": "edit",
          "new": "edit",
        }
    });

    var router = new Router;
    router.on('route:home', function() {
      // render user list
      contactListView.render();
    })
    router.on('route:edit', function(id) {
      userEditView.render({id: id});
    })

    Backbone.history.start();               
})(jQuery, Backbone, _)