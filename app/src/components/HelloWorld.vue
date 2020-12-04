<template>
  <v-container id="wrapper">
    <v-container id="bottons">
      <v-row>
        <v-col>
          <v-btn depressed color="blue" v-on:click="connect('blue')">
            Connect Indego
          </v-btn> 
          <v-btn depressed color="red" v-on:click="connect('red')">
            Connect Red
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-container id="stateContainer">
      <v-card v-if="socket" class="mx-auto" max-width="1000">
          <v-toolbar :color="connection" dark>
            <v-toolbar-title>{{connection}}</v-toolbar-title>
          </v-toolbar>
          <v-container id="state" fluid>
            <v-row dense>
              <v-btn color="green" v-on:click="handleBtnClick">
                Click
              </v-btn>
            </v-row>
            <v-row dense>
              <h3>Attendees</h3>
              {{members}}
            </v-row>
            <v-row dense>
              <h3>State</h3>
              {{state}}
            </v-row>
          </v-container>
      </v-card>
    </v-container>
  </v-container>
</template>


<script>
import io from 'socket.io-client';

export default {
  name: "HelloWorld",

  data: () => ({
    socket: undefined,
    members: {},
    state: {},
    connection: undefined,
    clicked: false
  }),
  methods: {
    send: function(update) {
      this.socket.emit('send', update);
    },
    connect: function(color) {
      let urls = {
        'blue': 'localhost:3000',
        'red': 'localhost:3001',
      };
      let url = urls[color];
      this.socket = io.connect(url);
      this.connection = color;
      this.socket.on('connect', function() {
        console.log(`socketEvent: socket connected to ${url}`)
      });
      this.socket.on('connect_error', function () {
        console.error('could not connect to socket server');
      });
      this.socket.on('disconnect', () => {
        console.log('disconnected from socket server')
      });
      this.socket.on('stateUpdates', (update) => {
        this.handleStateUpdate(update);
      });
      this.socket.on('member_add', (member) => {
        this.$set(this.members, member.socket, member)
        this.$set(this.state, member.username, {})
      });
      this.socket.on('message_history', (messages) => {
        this.messages = messages;
      });
      this.socket.on('member_history', (members) => {
        this.members = members;
      })
    },
    handleStateUpdate: function(update) {
      console.log(update)
      if(update.stateUpdate.action === 'clickOn') {
        this.$set(this.state[update.username], 'click', 'on');
      }
      if(update.stateUpdate.action === 'clickOff') {
        this.$set(this.state[update.username], 'click', 'off');
      }
    },
    handleBtnClick: function() {
      if (!this.clicked) {
        this.socket.emit('send', {action: 'clickOn'});
        this.clicked = true;
      } else {
        this.socket.emit('send', {action: 'clickOff'});
        this.clicked = false;
      }
    }
  }
};
</script>
