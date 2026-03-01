    (function() {
      // ----- story generator data -----
      const protagonists = [
        'a lost astronaut', 'a curious cat', 'an old librarian', 'a time-traveling chef',
        'a robot gardener', 'a pirate queen', 'a shy wizard', 'a detective duck',
        'a ghost in the attic', 'a runaway train', 'a singing statue', 'a cloud sculptor'
      ];

      const actions = [
        'discovers', 'steals', 'paints', 'sings to', 'destroys', 'builds',
        'escapes from', 'dances with', 'unlocks', 'plants', 'whispers to', 'fights'
      ];

      const objects = [
        'a magic key', 'the last star', 'a forgotten song', 'a purple onion',
        'a talking stone', 'the moon', 'a secret map', 'a tin whistle',
        'a glowing seed', 'a cursed selfie', 'an infinite sandwich', 'a broken compass'
      ];

      const settings = [
        'on Mars', 'in a silent library', 'under the ocean', 'at midnight',
        'inside a dream', 'during a storm', 'in a haunted mall', 'on a flying island',
        'in the year 3099', 'behind the waterfall', 'in a coffee shop', 'among the clouds'
      ];

      // story database: all generated stories (history)
      let savedStories = []; // each { id, text, protagonist, action, object, setting, timestamp }

      // current story object
      let currentStory = {
        id: 'init_' + Date.now(),
        text: 'Click spin to generate a story idea',
        protagonist: '✨',
        action: '',
        object: '',
        setting: '',
        timestamp: Date.now()
      };

      // DOM elements
      const storyTextDisplay = document.getElementById('storyTextDisplay');
      const storyTags = document.getElementById('storyTags');
      const spinBtn = document.getElementById('spinBtn');
      const saveStoryBtn = document.getElementById('saveStoryBtn');
      const regenerateBtn = document.getElementById('regenerateBtn');
      const historyContainer = document.getElementById('historyContainer');
      const storyCounter = document.getElementById('storyCounter');

      // helper: generate a random story object
      function generateRandomStory() {
        const protagonist = protagonists[Math.floor(Math.random() * protagonists.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const object = objects[Math.floor(Math.random * objects.length)]; // FIX: was incorrectly using length
        const objectFixed = objects[Math.floor(Math.random() * objects.length)];
        const setting = settings[Math.floor(Math.random() * settings.length)];
        // build text
        const text = `${protagonist} ${action} ${objectFixed} ${setting}.`;
        return {
          id: 'story_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          protagonist,
          action,
          object: objectFixed,
          setting,
          text,
          timestamp: Date.now()
        };
      }

      // render current story to UI
      function renderCurrentStory() {
        storyTextDisplay.innerText = currentStory.text;
        // create tag html
        let tagsHtml = '';
        if (currentStory.protagonist) {
          tagsHtml += `<span class="tag">🧙 ${currentStory.protagonist.substring(0, 18)}</span>`;
        }
        if (currentStory.setting) {
          tagsHtml += `<span class="tag">🌍 ${currentStory.setting.substring(0, 18)}</span>`;
        }
        if (currentStory.object) {
          tagsHtml += `<span class="tag">🔮 ${currentStory.object.substring(0, 18)}</span>`;
        }
        storyTags.innerHTML = tagsHtml || '<span class="tag">✨ new</span>';
      }

      // render history chips
      function renderHistory() {
        if (savedStories.length === 0) {
          historyContainer.innerHTML = '<div class="empty-history">✨ spin and save your first story</div>';
          return;
        }

        let chipsHtml = '';
        // show last 8, newest first
        const recent = [...savedStories].reverse().slice(0, 8);
        recent.forEach(story => {
          const shortText = story.text.length > 35 ? story.text.slice(0, 32) + '…' : story.text;
          chipsHtml += `
            <div class="story-chip" data-id="${story.id}">
              <span class="chip-icon">📖</span>
              <span class="chip-text">${shortText}</span>
              <button class="chip-restore" data-id="${story.id}" title="load this story">↩</button>
            </div>
          `;
        });
        historyContainer.innerHTML = chipsHtml;

        // attach restore listeners
        document.querySelectorAll('.chip-restore').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const story = savedStories.find(s => s.id === id);
            if (story) {
              currentStory = { ...story }; // copy
              renderCurrentStory();
            }
          });
        });
      }

      // update story counter
      function updateCounter() {
        storyCounter.innerText = savedStories.length + ' story' + (savedStories.length !== 1 ? 's' : '');
      }

      // spin new story (and set as current)
      function spinNewStory() {
        currentStory = generateRandomStory();
        renderCurrentStory();
      }

      // save current story to history
      function saveCurrentStory() {
        // avoid duplicate identical? we can allow duplicates, but check if it's exactly same text?
        // but it's fun to have duplicates, we keep.
        const storyCopy = { ...currentStory, id: 'saved_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) };
        savedStories.push(storyCopy);
        renderHistory();
        updateCounter();
      }

      // event listeners
      spinBtn.addEventListener('click', () => {
        spinNewStory();
      });

      regenerateBtn.addEventListener('click', () => {
        spinNewStory();
      });

      saveStoryBtn.addEventListener('click', () => {
        // only save if story is not the placeholder?
        if (currentStory.text && currentStory.text !== 'Click spin to generate a story idea') {
          saveCurrentStory();
        } else {
          alert('spin a story first!');
        }
      });

      // initialize with one random story for engagement
      function initDemo() {
        currentStory = generateRandomStory();
        renderCurrentStory();
        // add a couple of saved examples
        const demo1 = generateRandomStory();
        const demo2 = generateRandomStory();
        savedStories.push(demo1, demo2);
        renderHistory();
        updateCounter();
      }

      initDemo();

      // extra: double-click on stage to spin
      document.querySelector('.story-stage').addEventListener('dblclick', () => {
        spinNewStory();
      });
    })();