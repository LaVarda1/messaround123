<template lang="pug">
.faq 
  h2 Frequently Asked Questions 
  .accordion(v-for="(qa, idx) in qas")
    input(type="radio" :id="'accordion-' + idx" name="accordion-radio" hidden)
    label.accordion-header(:for="'accordion-' + idx")
      i.icon.icon-arrow-right.mr-1 
      | {{ qa.question }} 
    .accordion-body(v-html="qa.answer")

</template>
<script setup lang="ts">
type QA = {
  question: string
  answer: string
}

const qas = [{
  question: 'What is a pak file?',
  answer: `A pak file is an archive of files that contain game assets like maps, models, sounds, etc. 
   The base game shipped with two pak files - pak0.pak and pak1.pak. The first one, pak0.pak, shipped with the shareware 
   version of quake which was freely distributable.  The pak1.pak was only shipped with the purchased version which is why
   this site cannot provide this file for you.  This file is also required to play any modified games or maps.`
}, {
  question: 'Where can I buy quake?',
  answer: `GoG or Steam still sell quake for ~$10.  It usually goes on sale for under $5, as of this writing, 
    it's currently $4. `
}, {
  question: 'Where is my pak1.pak file?',
  answer: `The pak1 file is in the id1 directory of your quake installation.  Your quake installation can 
  depend where you bought it.  For steam on windows, this is C:\Program Files (x86)\Steam\steamapps\common\Quake.  
  GoG may install here C:\GOG Games\Quake.`
}, {
  question: 'How do I assign a key to the rocket launcher?',
  answer: `The original quake had limited options in the options menu. Sadly, assigning weapons to keys is also missing. 
    There are a few ways of going about this to "bind" key to the action. One is via the console - you can enter
      <p><pre>bind <key> "impulse <#>"</pre> 
      <p>where # is the number of the weapon:
        <ul>
          <li>1 - axe</li>
          <li>2 - Shotgun</li>
          <li>3 - Super Shotgun</li>
          <li>4 - Nailgun</li>
          <li>5 - Super Nailgun</li>
          <li>6 - Grenade Launcher</li>
          <li>7 - Rocket Launcher</li>
          <li>8 - Lighning gun</li>
        </ul>
      <p> You can also edit your <pre>config.cfg</pre> in setup and add these binds directly. They apply when you start
        the game.
      <p>This can also be used to assign other actions.`
}]
</script>