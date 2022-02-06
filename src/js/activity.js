import moment from 'moment';
import '../css/activity.scss';

const storageKey = 'activity';

function getStorageDefault(key, defaultVal) {
  let item = localStorage.getItem(storageKey+"/"+key);
  return (item)? JSON.parse(item) : defaultVal;
}

function setStorageDefault(key, val) {
  localStorage.setItem(storageKey+"/"+key, JSON.stringify(val));
}

var activity = {
  data() {
    return {
      logs: getStorageDefault("logs", [
        { subject: "subject 1", beginTime: '2022-02-05T11:00' },
        { subject: "bar", beginTime: '2022-02-05T12:00' },
        { subject: "foobar", beginTime: '2022-02-05T13:00' },
      ]),
      mode: 'normal',
      subject: "",
      subjectsDefault: [
        { text: "Not Active" },
        { text: "Misc" },
        { text: "Breaktime" },
      ],
      show: true
    };
  },
  methods: {
    changeMode(mode) {
      this.mode = mode;
      if(mode === 'normal') {
        this.$nextTick(() => {
          this.setScrollBottom();
        });
      }
    },
    deleteAllLog() {
      this.logs = [];
      this.changeMode('normal');
    },
    isMode(mode) {
      return this.mode === mode;
    },
    switchActivity() {
      this.logs.push({
        subject: this.subject,
        beginTime: moment().format('YYYY-MM-DDTHH:mm')
      });

      this.setScrollBottom();

      this.clearSubject();
    },
    deleteLog(log, index) {
      this.logs.splice(index, 1);
    },
    clearSubject() {
      this.subject = "";
    },
    setScrollBottom() {
      if(this.$refs.logContainer) {
        this.$nextTick(() => {
          this.$refs.logContainer.scrollTo(0, 
            this.$refs.logContainer.scrollHeight);
        });
      }
    },
    openActivity() {
      this.show = true;
    },
    closeActivity() {
      this.show = false;
    },
    sortLog() {
      this.logs.sort((a,b) => {
        let sortKeyA = a.beginTime;
        let sortKeyB = b.beginTime;

        if(sortKeyA < sortKeyB) {
          return -1;
        } else if(sortKeyA = sortKeyB) {
          return 0;
        }  else if(sortKeyA > sortKeyB) {
          return 1;
        }
      });
    },
    formatComprehensiveTime(minutes) {
      let h = Math.floor(minutes / 60);
      let m = minutes % 60;
      if(h > 0) {
        return `${h}<span style="font-size:0.7em">h</span>${m}<span style="font-size:0.7em">m</span>`;
      } else {
        return `${m}<span style="font-size:0.7em">m</span>`;
      }
    }
  },
  computed: {
    subjects() {
      let ls = [];

      this.subjectsDefault.map(s => {
        ls.push(s);
      });

      this.logs.map(x => {
        if(!ls.find(s => s.text == x.subject)) {
          ls.push({ text: x.subject });
        }
      });

      return ls;
    },
    statistics() {
      let stats = {};

      if(this.logs.length >= 2) {
        for(var i = 1; i < this.logs.length; i++) {

          let ls = this.logs[i-1];
          let le = this.logs[i];
          let s = moment(ls.beginTime, "YYYY-MM-DDTHH:mm");
          let e = moment(le.beginTime, "YYYY-MM-DDTHH:mm");
          let sd = s.format("YYYY-MM-DD");

          if(!stats[sd]) {
            stats[sd] = { day: sd, stats: {} };
          }

          if(!(stats[sd].stats[ls.subject])) {
            stats[sd].stats[ls.subject] = { subject: ls.subject, time: 0 };
          }

          stats[sd].stats[ls.subject].time = stats[sd].stats[ls.subject].time + e.diff(s, "minutes");
        }
      }

      return Object.entries(stats)
        .map(([k,v]) => {
          return { 
            day:k, 
            stat: Object.entries(v.stats)
              .map(([ck,cv]) => {
                return cv;
              })
              .sort((a,b) => {
                let sortKeyA = b.time;
                let sortKeyB = a.time;

                if(sortKeyA < sortKeyB) {
                  return -1;
                } else if(sortKeyA = sortKeyB) {
                  return 0;
                }  else if(sortKeyA > sortKeyB) {
                  return 1;
                }
              })
          };
        })
        .sort((a,b) => {
          let sortKeyA = a.day;
          let sortKeyB = b.day;

          if(sortKeyA < sortKeyB) {
            return -1;
          } else if(sortKeyA = sortKeyB) {
            return 0;
          }  else if(sortKeyA > sortKeyB) {
            return 1;
          }
        });
    }
  },
  watch: {
    show: {
      handler(val) {
        if(val) {
          this.changeMode('normal');
          this.setScrollBottom();
        }
      }
    },
    logs: {
      handler() {
        setStorageDefault("logs", this.logs);
      },
      deep: true
    }
  },
  mounted() {
    if(this.show && this.mode === 'normal') {
      this.setScrollBottom();
    }
  },
  template:
`
<div class="ac-form" v-if="show">
  <div class="ac-container ac-w-100 ac-h-100 ac-layout-vertical">

    <!-- title -->
    <span class="ac-inline-block ac-w-100" style="text-align:center; height:25px;">
      <span class="ac-inline-block ac-w-100" style="text-align:center; font-size:1.2em; color:#888;">ACTIVITY TRACKER</span>
      <span class="" style="position:absolute; right:2px; top:-3px; cursor:pointer" @click="closeActivity()">
        <svg width="20" height="20" viewBox="0 0 100 100">
          <line x1="20" y1="20" x2="80" y2="80" stroke="#555" stroke-width="2" />
          <line x1="80" y1="20" x2="20" y2="80" stroke="#555" stroke-width="2" />
          <circle cx="50" cy="50" r="40" stroke="#555" fill-opacity="0.0" stroke-width="2"/>
        </svg>
      </span>
    </span>

    <!-- top controls -->
    <input type="text" name="subject" list="subjects" class="ac-input-text ac-w-80" v-model="subject" spellcheck="false" autocomplete="off" placeholder="Input or select subject" />
    <datalist id="subjects">
      <option v-for="s in subjects" :value="s.text" />
    </datalist>
    <button class="ac-button-secondary ac-float-right" @click="clearSubject()">CLEAR</button>
    <button class="ac-button-primary ac-w-100" @click="switchActivity()">SWITCH ACTIVITY</button>

    <!-- logs -->
    <div ref="logContainer" class="ac-container ac-w-100 ac-overflow-x-scroll ac-overflow-y-scroll" style="height:calc(100% - 130px);">
      <template v-if="isMode('statistics')">
        <template v-for="dayStat in statistics">
          <span>{{ dayStat.day }}</span>
          <ul>
            <template v-for="stat in dayStat.stat">
              <li class="ac-nowrap">
                <span>{{ stat.subject }}</span>:&nbsp;<span v-html="formatComprehensiveTime(stat.time)"></span>
              </li>
            </template>
          </ul>
        </template>
      </template>
      <template v-if="isMode('normal') || isMode('delete')">
        <template v-for="(log, index) in logs">
          <div class="ac-log-entry ac-nowrap">
            <span style="cursor:pointer" @click="deleteLog(log, index)">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <line x1="0" y1="3" x2="5" y2="8" stroke="#000" />
                <line x1="5" y1="3" x2="0" y2="8" stroke="#000" />
              </svg>
            </span>
            <input type="text" class="ac-input-text" v-model="log.subject" style="width:130px;" spellcheck="false" autocomplete="off" list="subjects"/>
            :
            <input type="datetime-local" class="ac-input-datetime-local" v-model="log.beginTime" style="width:140px" @blur="sortLog()"/>
          </div>
        </template>
      </template>
    </div>

    <!-- bottom controls -->
    <div class="ac-container-translucent ac-layout-horizontal ac-w-100" style="position:absolute; bottom:5px;">
        <button class="ac-button-secondary" v-if="isMode('normal')" @click="changeMode('statistics')">STATISTICS</button>
        <button class="ac-button-secondary ac-float-right ac-m-0" style="margin-right:10px !important;" v-if="isMode('normal')" @click="changeMode('delete')">DELETE ALL LOG</button>
        <button class="ac-button-secondary" v-if="isMode('statistics')" @click="changeMode('normal')">CLOSE STATISTICS</button>
        <button class="ac-button-danger ac-w-20" v-if="isMode('delete')" @click="deleteAllLog()">CONFIRM</button>
        <button class="ac-button-secondary ac-w-70" v-if="isMode('delete')" @click="changeMode('normal')">CANCEL</button>
    </div>
  </div>
</div>
`
};

window.activity = activity;

