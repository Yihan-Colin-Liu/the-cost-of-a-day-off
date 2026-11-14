
const app = document.getElementById("app");
const soundToggle = document.getElementById("soundToggle");

const initialState = () => ({
  version: "no_leave",
  money: 96,
  health: 70,
  stress: 40,
  visitedClinic: false,
  followedAdvice: false,
  lostWages: 0,
  medicalCost: 0,
  transportCost: 0,
  groceryBought: false,
  decisionPath: []
});

let state = initialState();
let results = { no_leave: null, paid_leave: null };
let audioContext = null;

const scenes = {
  landing() {
    app.innerHTML = `
      <section class="hero fade-in">
        <div>
          <div class="eyebrow">Interactive story · about 10 minutes</div>
          <h1>The cost of a day off.</h1>
          <p class="lede">What happens when taking care of your health means losing your pay?</p>
          <div class="button-row">
            <button class="primary" data-action="start">Start the story</button>
          </div>
          <p class="small" style="margin-top:18px">All characters, events, dialogue, and monetary amounts in this story are fictional.</p>
        </div>
        <div class="art-card">
          <img src="assets/apartment.svg" alt="Original illustration of Elena in a small apartment at dawn">
        </div>
      </section>
    `;
  },

  intro() {
    app.innerHTML = `
      <section class="scene fade-in">
        <div class="scene-grid">
          <div class="scene-copy">
            <div class="scene-label">Meet Elena</div>
            <h2>One appointment.</h2>
            <p class="dialogue">Elena is 31. She works in hotel housekeeping and is paid by the hour. For three weeks, her wrist has been hurting and sometimes feels numb after long shifts.</p>
            <p>She made an appointment at a community clinic for today.</p>
            <div class="info-card">
              <div class="money">$16 / hour</div>
              <p class="small">8:00 AM–4:30 PM · $96 available · clinic appointment at 2:00 PM</p>
            </div>
            <button class="primary" data-action="continue">Continue</button>
          </div>
          <div class="art-card">
            <img src="assets/bedroom.svg" alt="Original illustration of Elena checking the time in her bedroom">
            ${statusHTML()}
          </div>
        </div>
      </section>
    `;
  },

  morning() {
    app.innerHTML = `
      <section class="scene fade-in">
        <div class="scene-grid">
          <div class="scene-copy">
            <div class="scene-label">Monday · 7:12 AM</div>
            <h2>The message.</h2>
            <p class="dialogue">Elena checks her phone. Her manager has sent a message:</p>
            <div class="quote">“We’re short today. Can you stay for the full shift?”</div>
            <p>Her clinic appointment is at 2:00 PM.</p>
            <div class="choice-list">
              <button class="choice" data-choice="work">Go to work</button>
              <button class="choice" data-choice="clinic">Go to the clinic</button>
            </div>
          </div>
          <div class="art-card">
            <img src="assets/phone.svg" alt="Original illustration of a phone showing a work message">
            ${statusHTML()}
          </div>
        </div>
      </section>
    `;
  },

  work() {
    state.decisionPath.push("work");
    state.money += 128;
    state.health -= 12;
    state.stress += 8;
    app.innerHTML = `
      <section class="scene fade-in">
        <div class="scene-grid">
          <div class="scene-copy">
            <div class="scene-label">Monday · 8:03 AM</div>
            <h2>She goes to work.</h2>
            <p class="dialogue">Elena lifts towels, pushes a cart, and keeps moving. Her wrist hurts when she reaches for the upper shelves.</p>
            <div class="info-card">
              <div class="mono">PAY TODAY</div>
              <div class="money">+$128</div>
            </div>
            <p>She cancels the clinic appointment. The clinic can offer another appointment next week.</p>
            <div class="choice-list">
              <button class="choice" data-choice="reschedule">Call the clinic and reschedule</button>
              <button class="choice" data-choice="wait">Wait and see if it gets better</button>
            </div>
          </div>
          <div class="art-card">
            <img src="assets/hotel.svg" alt="Original illustration of Elena working in a hotel hallway">
            ${statusHTML()}
          </div>
        </div>
      </section>
    `;
  },

  clinic() {
    state.decisionPath.push("clinic");
    state.visitedClinic = true;
    state.lostWages = state.version === "paid_leave" ? 0 : 56;
    state.medicalCost = 20;
    state.transportCost = 6;
    state.money -= state.medicalCost + state.transportCost + state.lostWages;
    state.stress += 4;
    app.innerHTML = `
      <section class="scene fade-in">
        <div class="scene-grid">
          <div class="scene-copy">
            <div class="scene-label">Monday · 1:17 PM</div>
            <h2>She leaves work.</h2>
            <p class="dialogue">Elena takes the bus to the clinic.</p>
            <div class="receipt">
              <div class="receipt-row"><span>Missed wages</span><strong>${money(-state.lostWages)}</strong></div>
              <div class="receipt-row"><span>Bus fare</span><strong>${money(-state.transportCost)}</strong></div>
              <div class="receipt-row"><span>Clinic cost</span><strong>${money(-state.medicalCost)}</strong></div>
              <div class="receipt-row receipt-total"><span>Money left</span><strong>${money(state.money)}</strong></div>
            </div>
            <p>In this version, the cost of missing work is ${state.lostWages === 0 ? "covered by paid sick leave." : "lost wages."}</p>
            <button class="primary" data-action="doctor">Continue to the appointment</button>
          </div>
          <div class="art-card">
            <img src="assets/bus.svg" alt="Original illustration of Elena on a city bus">
            ${statusHTML()}
          </div>
        </div>
      </section>
    `;
  },

  doctor() {
    app.innerHTML = `
      <section class="scene fade-in">
        <div class="scene-grid">
          <div class="scene-copy">
            <div class="scene-label">Monday · 2:04 PM</div>
            <h2>The appointment.</h2>
            <p class="dialogue">The clinician asks how long the pain has been there.</p>
            <div class="quote">
              <strong>Clinician:</strong> “How long has the pain been there?”<br><br>
              <strong>Elena:</strong> “About three weeks. It gets worse when I work.”
            </div>
            <p>The clinician recommends reducing repetitive lifting, resting the wrist when possible, and returning for follow-up if the numbness continues.</p>
            <div class="info-card">
              <div class="mono">MEDICAL ADVICE</div>
              <p>Reduce repetitive lifting.<br>Rest the wrist when possible.<br>Return for follow-up if symptoms continue.</p>
            </div>
            <button class="primary" data-action="advice">Continue</button>
          </div>
          <div class="art-card">
            <img src="assets/clinic.svg" alt="Original illustration of a community clinic consultation">
            ${statusHTML()}
          </div>
        </div>
      </section>
    `;
  },

  advice() {
    app.innerHTML = `
      <section class="scene fade-in">
        <div class="scene-grid">
          <div class="scene-copy">
            <div class="scene-label">Monday · 5:16 PM</div>
            <h2>The advice has a cost.</h2>
            <p class="dialogue">Elena gets home and looks at tomorrow’s schedule. She knows that following the advice may mean asking for fewer hours.</p>
            <div class="choice-list">
              <button class="choice" data-choice="follow">Follow the medical advice</button>
              <button class="choice" data-choice="workAgain">Go back to work as scheduled</button>
            </div>
          </div>
          <div class="art-card">
            <img src="assets/home.svg" alt="Original illustration of Elena reviewing a work schedule at home">
            ${statusHTML()}
          </div>
        </div>
      </section>
    `;
  },

  expenses() {
    app.innerHTML = `
      <section class="scene fade-in">
        <div class="scene-grid">
          <div class="scene-copy">
            <div class="scene-label">Friday</div>
            <h2>There are other bills.</h2>
            <p class="dialogue">Elena checks her account. She still needs groceries for the weekend.</p>
            <div class="receipt">
              <div class="receipt-row"><span>Money available</span><strong>${money(state.money)}</strong></div>
              <div class="receipt-row"><span>Groceries</span><strong>$35</strong></div>
              <div class="receipt-row"><span>Phone bill</span><strong>$40</strong></div>
              <div class="receipt-row"><span>Household needs</span><strong>$20</strong></div>
            </div>
            <div class="choice-list">
              <button class="choice" data-choice="groceries">Buy groceries</button>
              <button class="choice" data-choice="save">Save the money</button>
            </div>
          </div>
          <div class="art-card">
            <img src="assets/kitchen.svg" alt="Original illustration of groceries and an open wallet">
            ${statusHTML()}
          </div>
        </div>
      </section>
    `;
  },

  result() {
    const r = {
      version: state.version,
      visitedClinic: state.visitedClinic,
      lostWages: state.lostWages,
      medicalCost: state.medicalCost,
      transportCost: state.transportCost,
      money: state.money,
      health: Math.max(0, Math.min(100, state.health)),
      stress: Math.max(0, state.stress),
      followedAdvice: state.followedAdvice,
      groceryBought: state.groceryBought,
      path: [...state.decisionPath]
    };
    results[state.version] = r;

    if (state.version === "no_leave") {
      app.innerHTML = `
        <section class="scene fade-in">
          <div class="scene-copy">
            <div class="scene-label">End of version one</div>
            <h2>Your first story.</h2>
            <p class="dialogue">This version showed Elena’s week without paid sick leave.</p>
            ${resultReceipt(r)}
            <div class="callout">
              <p><strong>The cost of care is not always printed on the clinic bill.</strong></p>
              <p>Time away from work can also mean lost income. That lost income can compete with food, transportation, and other everyday needs.</p>
            </div>
            <button class="primary" data-action="secondVersion">Play the same story again</button>
          </div>
        </section>
      `;
    } else {
      renderComparison();
    }
  }
};

function money(n) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(0)}`;
}

function statusHTML() {
  return `
    <div class="status">
      <div class="stat">MONEY<strong>${money(state.money)}</strong></div>
      <div class="stat">HEALTH<strong>${Math.max(0, Math.min(100, state.health))}</strong></div>
      <div class="stat">STRESS<strong>${Math.max(0, state.stress)}</strong></div>
    </div>
  `;
}

function resultReceipt(r) {
  return `
    <div class="receipt">
      <div class="receipt-row"><span>Clinic visit</span><strong>${r.visitedClinic ? "Yes" : "No"}</strong></div>
      <div class="receipt-row"><span>Lost wages</span><strong>${money(r.lostWages)}</strong></div>
      <div class="receipt-row"><span>Clinic cost</span><strong>${money(r.medicalCost)}</strong></div>
      <div class="receipt-row"><span>Transportation</span><strong>${money(r.transportCost)}</strong></div>
      <div class="receipt-row"><span>Followed medical advice</span><strong>${r.followedAdvice ? "Yes" : "No"}</strong></div>
      <div class="receipt-row"><span>Groceries bought</span><strong>${r.groceryBought ? "Yes" : "No"}</strong></div>
      <div class="receipt-row receipt-total"><span>Money remaining</span><strong>${money(r.money)}</strong></div>
    </div>
  `;
}

function renderComparison() {
  const a = results.no_leave;
  const b = results.paid_leave;
  app.innerHTML = `
    <section class="scene fade-in">
      <div class="scene-copy" style="max-width:900px">
        <div class="scene-label">Comparison</div>
        <h2>Same worker. Same health problem.</h2>
        <p class="dialogue">The second version changed one working condition: whether Elena could take paid sick leave.</p>
        <table class="compare">
          <thead>
            <tr><th></th><th>Without paid sick leave</th><th>With paid sick leave</th></tr>
          </thead>
          <tbody>
            <tr><td>Clinic visit</td><td>${a.visitedClinic ? "Yes" : "No"}</td><td>${b.visitedClinic ? "Yes" : "No"}</td></tr>
            <tr><td>Lost wages</td><td>${money(a.lostWages)}</td><td>${money(b.lostWages)}</td></tr>
            <tr><td>Clinic cost</td><td>${money(a.medicalCost)}</td><td>${money(b.medicalCost)}</td></tr>
            <tr><td>Transportation</td><td>${money(a.transportCost)}</td><td>${money(b.transportCost)}</td></tr>
            <tr><td>Followed medical advice</td><td>${a.followedAdvice ? "Yes" : "No"}</td><td>${b.followedAdvice ? "Yes" : "No"}</td></tr>
            <tr><td>Money remaining</td><td>${money(a.money)}</td><td>${money(b.money)}</td></tr>
          </tbody>
        </table>

        <div class="callout">
          <h3>What changed?</h3>
          <p>The clinic did not change. Elena did not change. Her symptoms did not change. The cost of the appointment did not change.</p>
          <p><strong>Her working conditions changed.</strong></p>
        </div>

        <div class="button-row">
          <button class="primary" data-action="reflection">Continue</button>
          <button class="secondary" data-action="restart">Play again from the beginning</button>
        </div>
      </div>
    </section>
  `;
}

function renderReflection() {
  app.innerHTML = `
    <section class="scene fade-in">
      <div class="scene-copy">
        <div class="scene-label">Reflection</div>
        <h2>Was it really the same decision?</h2>
        <p class="dialogue">In both versions, Elena wanted medical care. But the cost of taking time away from work was different.</p>
        <div class="choice-list">
          <button class="choice" data-choice="reflect1">Yes — the decision was basically the same.</button>
          <button class="choice" data-choice="reflect2">No — the conditions changed what was possible.</button>
        </div>
      </div>
    </section>
  `;
}

function renderClosing() {
  app.innerHTML = `
    <section class="scene fade-in">
      <div class="scene-copy" style="max-width:900px">
        <div class="scene-label">Closing</div>
        <h2>From a personal choice to a structural condition.</h2>

        <p class="dialogue">Elena’s story is fictional. Her choices, however, are shaped by conditions that extend beyond individual preference.</p>

        <p>She needs medical care, but she also needs income. When taking time away from work means losing wages, seeking care can compete with other basic needs.</p>

        <h3>Social determinants of health</h3>
        <p>Michael Marmot argues that health is strongly influenced by the social conditions in which people are born, live, work, and age. In Elena’s story, employment conditions shape what choices are realistically available to her. Her health decision cannot be separated from her income and working conditions.</p>

        <div class="reference">
          <strong>Marmot, Michael. 2006.</strong> “Health in an Unequal World: Social Circumstances, Biology and Disease.” <em>Clinical Medicine</em> 6 (6): 559–72.
        </div>

        <h3>Paid sick leave and delayed care</h3>
        <p>DeRigne, Stoddard-Dare, and Quinn (2016) found that workers without paid sick leave were more likely to delay or forgo medical care than workers with paid sick leave. The two versions of Elena’s story use this research as the basis for a fictional situation in which the possibility of losing wages affects a decision about seeking care.</p>

        <div class="reference">
          <strong>DeRigne, LeaAnne, Patricia Stoddard-Dare, and Linda Quinn. 2016.</strong> “Workers Without Paid Sick Leave Less Likely to Take Time Off for Illness or Injury Compared to Those With Paid Sick Leave.” <em>Health Affairs</em> 35 (3): 520–27. <a href="https://doi.org/10.1377/hlthaff.2015.0965" target="_blank" rel="noopener">doi:10.1377/hlthaff.2015.0965</a>.
        </div>

        <h3>Structural violence</h3>
        <p>Paul Farmer uses the concept of structural violence to describe how social structures and unequal access to resources can place certain groups at greater risk of suffering and poor health. Elena’s situation illustrates this idea at a small, fictional scale. Her decision is not made in a vacuum. The conditions of her employment shape the choices available to her.</p>

        <div class="reference">
          <strong>Farmer, Paul. 2003.</strong> <em>Pathologies of Power: Health, Human Rights, and the New War on the Poor</em>. University of California Press, pp. 29–50.
        </div>

        <div class="callout">
          <h3>One decision. Two conditions.</h3>
          <p>Healthcare decisions are personal. The conditions surrounding those decisions are not always.</p>
        </div>

        <h3 id="sources">About this project</h3>
        <p class="small">This website is an original fictional interactive story created for educational purposes. The character, dialogue, events, and monetary amounts are fictional. The research listed above informed the design of the situation; the game is not a clinical, legal, or financial representation of any individual worker’s circumstances.</p>

        <div class="button-row">
          <button class="primary" data-action="restart">Play again</button>
        </div>
      </div>
    </section>
  `;
}

function startVersion(version) {
  state = initialState();
  state.version = version;
  scenes.morning();
}

document.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  const choice = e.target.dataset.choice;

  if (action === "start") scenes.intro();
  else if (action === "continue") scenes.morning();
  else if (action === "doctor") scenes.doctor();
  else if (action === "advice") scenes.advice();
  else if (action === "secondVersion") startVersion("paid_leave");
  else if (action === "reflection") renderReflection();
  else if (action === "restart") {
    results = { no_leave: null, paid_leave: null };
    state = initialState();
    scenes.landing();
  }

  if (choice === "work") scenes.work();
  if (choice === "clinic") scenes.clinic();

  if (choice === "reschedule") {
    state.decisionPath.push("reschedule");
    state.health -= 4;
    state.stress += 6;
    scenes.expenses();
  }

  if (choice === "wait") {
    state.decisionPath.push("wait");
    state.health -= 8;
    state.stress += 5;
    scenes.expenses();
  }

  if (choice === "follow") {
    state.decisionPath.push("follow");
    state.followedAdvice = true;
    state.health += 12;
    state.stress += 5;
    if (state.version === "no_leave") state.money -= 64;
    scenes.expenses();
  }

  if (choice === "workAgain") {
    state.decisionPath.push("workAgain");
    state.health -= 10;
    state.stress += 8;
    state.money += 128;
    scenes.expenses();
  }

  if (choice === "groceries") {
    state.groceryBought = true;
    state.money -= 35;
    scenes.result();
  }

  if (choice === "save") {
    state.groceryBought = false;
    scenes.result();
  }

  if (choice === "reflect1" || choice === "reflect2") renderClosing();
});

soundToggle.addEventListener("click", () => {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  soundToggle.setAttribute("aria-pressed", "true");
  soundToggle.textContent = "Sound: On";
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.025, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.08);
});

scenes.landing();
