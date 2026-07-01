export const roadmapActivities = [
  ['Discovery, Teardown, Research & Brief Definition','Sprint 0','Project room kickoff','Align PM, ME, EE, ID and procurement on scope, risks and sprint method.','PM',4,'High',true,'Kickoff MoM'],
  ['Discovery, Teardown, Research & Brief Definition','Sprint 0','Define project scope and exclusions','Freeze what is included, excluded and assumed before design starts.','PM',8,'High',true,'Scope document'],
  ['Discovery, Teardown, Research & Brief Definition','Sprint 0','Prepare PRD / brief','Define objectives, CTQ, use cases, targets, acceptance criteria and constraints.','PM',12,'High',true,'PRD'],
  ['Discovery, Teardown, Research & Brief Definition','Sprint 0','Benchmark competitor products','Study products, teardown data, market range, features, cost and manufacturing clues.','ID',20,'Medium',false,'Benchmark report'],
  ['Discovery, Teardown, Research & Brief Definition','Sprint 0','Mechanical feasibility risks','Identify mechanism, material, assembly, size and performance risks.','ME',14,'High',false,'ME feasibility notes'],
  ['Discovery, Teardown, Research & Brief Definition','Sprint 0','Electronics feasibility risks','Identify sensor, actuator, PCB, power, firmware and control risks.','EE',12,'High',false,'EE feasibility notes'],
  ['Discovery, Teardown, Research & Brief Definition','Sprint 0','Cost benchmark and target budget','Create rough BOM, prototype budget, supplier assumptions and confidence range.','Procurement',12,'Medium',false,'Cost benchmark'],
  ['Discovery, Teardown, Research & Brief Definition','Gate 1','Discovery gate review','Check scope, CTQ, benchmark, risks, target cost and next sprint decision.','PM',4,'High',true,'Gate 1 decision'],

  ['POC1: Early Feasibility Proof','Sprint 1','POC1 test plan','Define what critical risk must be proven, test method, pass criteria and evidence.','PM',8,'High',true,'POC1 test plan'],
  ['POC1: Early Feasibility Proof','Sprint 1','Low-fidelity mechanical mockup','Build fast model to validate high-risk mechanism or assembly assumption.','ME',32,'High',false,'POC1 mockup'],
  ['POC1: Early Feasibility Proof','Sprint 1','Basic electronics trial setup','Prepare quick sensor, actuator, PCB or control trial setup for feasibility.','EE',24,'High',false,'EE trial setup'],
  ['POC1: Early Feasibility Proof','Sprint 1','Rapid ID / ergonomic check','Quick form, handling, access, interaction or packaging check where required.','ID',16,'Medium',false,'ID mockup notes'],
  ['POC1: Early Feasibility Proof','Sprint 1','POC sourcing and fabrication','Source critical samples, local fabrication and bought-outs for POC.','Procurement',16,'Medium',false,'POC purchase list'],
  ['POC1: Early Feasibility Proof','Gate 2','POC1 review','Review evidence, resolve first CTQs, update BOM/cost and decide go/rework.','PM',4,'High',true,'POC1 passport'],

  ['POC2: Integrated Validation POC','Sprint 2','Integrated POC architecture','Define functional integrated POC architecture across ME, EE, FW and ID.','PM',8,'High',true,'POC2 architecture'],
  ['POC2: Integrated Validation POC','Sprint 2','Refined mechanical subsystem','Refine mechanism, dimensions, interfaces and assembly based on POC1.','ME',36,'High',false,'Updated CAD/mockup'],
  ['POC2: Integrated Validation POC','Sprint 2','Electronics integration','Integrate sensors, actuators, PCB, firmware/control and wiring with prototype.','EE',36,'High',false,'Integrated EE setup'],
  ['POC2: Integrated Validation POC','Sprint 2','Interaction and form refinement','Adjust form, usability, access, CMF and packaging inputs after architecture.','ID',16,'Medium',false,'Updated ID deck'],
  ['POC2: Integrated Validation POC','Sprint 2','Prototype supplier quotes','Update supplier options, NRE, prototype cost and recurring BOM estimate.','Procurement',16,'Medium',false,'Supplier quotes'],
  ['POC2: Integrated Validation POC','Gate 3','Integrated POC review','Check functional integration, CTQ evidence, risk closure and prototype readiness.','PM',4,'High',true,'Gate 3 review'],

  ['Preliminary Prototype','Sprint 3','Prototype scope freeze','Freeze prototype purpose, validation baseline, budget and deliverables.','PM',8,'High',true,'Prototype plan'],
  ['Preliminary Prototype','Sprint 3','Detailed CAD for prototype','Prepare detailed CAD, interfaces, tolerance plan and drawings for prototype.','ME',48,'High',false,'Prototype CAD/drawings'],
  ['Preliminary Prototype','Sprint 3','Electronics BOM and wiring','Prepare PCB/BOM, wiring, firmware/control plan and test setup.','EE',32,'High',false,'EE BOM and wiring'],
  ['Preliminary Prototype','Sprint 3','Appearance / CMF detail','Finalize appearance direction, CMF, usability and visible-surface requirements.','ID',24,'Medium',false,'CMF sheet'],
  ['Preliminary Prototype','Sprint 3','Prototype procurement execution','Procure parts, vendor services, machining, samples and bought-outs.','Procurement',32,'High',false,'Prototype purchase tracker'],
  ['Preliminary Prototype','Gate 4','Prototype engineering review','Review build, integration issues, design verification, cost and go/no-go.','PM',4,'High',true,'Prototype review MoM'],

  ['Pre-Production Model','Sprint 4','Pre-production gap analysis','Identify manufacturing, reliability, compliance and supplier gaps.','PM',8,'High',true,'Gap analysis'],
  ['Pre-Production Model','Sprint 4','DFM / DFA refinement','Refine CAD, assembly, materials, fasteners, tolerance stack and process feasibility.','ME',40,'High',false,'DFM/DFA report'],
  ['Pre-Production Model','Sprint 4','Electronics reliability plan','Plan reliability checks, PCB revisions, firmware freeze and compliance gaps.','EE',28,'High',false,'Reliability plan'],
  ['Pre-Production Model','Sprint 4','Supplier and cost freeze support','Get supplier quotes, cost-down actions, MOQ, lead times and NRE clarity.','Procurement',32,'High',false,'Supplier package'],
  ['Pre-Production Model','Gate 5','Pre-production gate review','Review design freeze, BOM, cost, suppliers, risks and production-intent readiness.','PM',4,'High',true,'Pre-production decision'],

  ['Production Tooling Release','Sprint 5','Tooling release package','Prepare tool-ready CAD, drawings, BOM, tolerances and release checklist.','ME',40,'High',true,'Tooling data package'],
  ['Production Tooling Release','Sprint 5','Production process and QC plan','Define assembly process, SOP, QC points, inspection plan and acceptance criteria.','PM',16,'High',true,'Process and QC plan'],
  ['Production Tooling Release','Sprint 5','Tooling / vendor coordination','Coordinate tooling RFQs, supplier approvals, timelines, costs and release data.','Procurement',36,'High',false,'Tooling tracker'],
  ['Production Tooling Release','Gate 6','Launch readiness review','Confirm approved process, quality gates, cost variance closure and handover.','PM',4,'High',true,'Launch plan']
];
