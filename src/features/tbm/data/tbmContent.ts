export interface TBMItem {
  id: string;
  text: string;
}

export interface TBMSection {
  id: string;
  title: string;
  items: TBMItem[];
}

export const TBM_CONTENT: TBMSection[] = [
  {
    id: "section1",
    title: "Section 1: Personal Protective Equipment (PPE)",
    items: [
      { id: "1.1", text: "Head & Face: Hard hats are inspected for cracks; safety glasses/visors are clean and scratch-free." },
      { id: "1.2", text: "Body & Limbs: High-visibility vests are worn; gloves are appropriate for the specific task." },
      { id: "1.3", text: "Footwear: Safety boots are in good condition with adequate tread and toe protection." },
      { id: "1.4", text: "Specialized Gear: Fall arrest harnesses or respiratory protection (masks) are checked and fitted if required." },
    ],
  },
  {
    id: "section2",
    title: "Section 2: Site Environment & Hazards",
    items: [
      { id: "2.1", text: "Weather Conditions: Discussion on heat stress, rain, or wind levels that may impact outdoor work." },
      { id: "2.2", text: "Housekeeping: Work areas must be kept clear of debris; trip hazards and spills are identified and managed." },
      { id: "2.3", text: "Exclusion Zones: Danger tape or barricades are in place around high-risk areas." },
      { id: "2.4", text: "Lighting & Access: Ensure all entry points and workspaces have sufficient lighting for the task." },
    ],
  },
  {
    id: "section3",
    title: "Section 3: Tools & Equipment Safety",
    items: [
      { id: "3.1", text: "Pre-use Inspection: All power tools and hand tools have been checked for damaged cords or missing guards." },
      { id: "3.2", text: "Tagging: All electrical equipment has a valid, up-to-date safety tag (test and tag)." },
      { id: "3.3", text: "Stored Energy: Lock-out/Tag-out (LOTO) procedures are confirmed for any machinery maintenance." },
      { id: "3.4", text: "Correct Tool for the Job: Confirmation that workers are not using \"make-shift\" tools for specialized tasks." },
    ],
  },
  {
    id: "section4",
    title: "Section 4: Task-Specific Risks (The \"Work Today\")",
    items: [
      { id: "4.1", text: "Manual Handling: Assessment of heavy loads; team lifting or mechanical aids are prioritized." },
      { id: "4.2", text: "Working at Heights: Confirmation that ladders are secured and scaffolding has a valid \"green tag\"." },
      { id: "4.3", text: "Overhead/Underground Services: Identification of power lines, gas pipes, or water mains in the immediate vicinity." },
      { id: "4.4", text: "Chemical Safety: Review of Safety Data Sheets (SDS) for any hazardous substances being used today." },
    ],
  },
  {
    id: "section5",
    title: "Section 5: Emergency & Communication",
    items: [
      { id: "5.1", text: "First Aid: Confirmation of the location of the nearest first aid kit and the designated First Aider." },
      { id: "5.2", text: "Evacuation: Review of the emergency assembly point and the fastest exit routes." },
      { id: "5.3", text: "Incident Reporting: Reminder that all \"near misses\" must be reported immediately." },
      { id: "5.4", text: "Stop Work Authority: Reiteration that every worker has the right to stop work if they perceive an unsafe condition." },
    ],
  },
];
