'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, supabaseReady } from '@/lib/supabase';
import { roadmapActivities } from '@/lib/roadmap';
import { Activity, ChangeRequest, Client, Project, Resource, Review } from '@/lib/types';
import { AlertCircle, CheckCircle2, Clock, IndianRupee, LayoutDashboard, ListChecks, KanbanSquare, Users, CalendarDays, FileWarning, RefreshCw, Plus, Save } from 'lucide-react';

const statuses = ['To Do','In Progress','Review','Blocked','Done'];
const phases = ['Discovery, Teardown, Research & Brief Definition','POC1: Early Feasibility Proof','POC2: Integrated Validation POC','Preliminary Prototype','Pre-Production Model','Production Tooling Release'];
const roleMap:any = { PM:'Project Manager', ME:'Mechanical Engineer', EE:'Electronics Engineer', ID:'Industrial Designer', Procurement:'Procurement' };

type Tab = 'dashboard'|'projects'|'activities'|'kanban'|'resources'|'gantt'|'reviews'|'cr';

function money(n:any){ return '₹' + Number(n||0).toLocaleString('en-IN'); }
function pct(n:any){ return `${Math.round(Number(n||0))}%`; }

export default function Home(){
  const [tab,setTab] = useState<Tab>('dashboard');
  const [clients,setClients] = useState<Client[]>([]);
  const [resources,setResources] = useState<Resource[]>([]);
  const [projects,setProjects] = useState<Project[]>([]);
  const [activities,setActivities] = useState<Activity[]>([]);
  const [reviews,setReviews] = useState<Review[]>([]);
  const [crs,setCrs] = useState<ChangeRequest[]>([]);
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState('');

  const loadAll = async()=>{
    if(!supabase) return;
    setLoading(true);
    const [c,r,p,a,rv,cr] = await Promise.all([
      supabase.from('clients').select('*').order('client_name'),
      supabase.from('resources').select('*').order('resource_name'),
      supabase.from('projects').select('*, clients(*), resources(*)').order('created_at',{ascending:false}),
      supabase.from('activities').select('*, projects(*, clients(*), resources(*)), resources(*)').order('created_at',{ascending:true}),
      supabase.from('reviews').select('*, projects(*)').order('created_at',{ascending:false}),
      supabase.from('change_requests').select('*, projects(*)').order('created_at',{ascending:false})
    ]);
    if(c.data) setClients(c.data as Client[]);
    if(r.data) setResources(r.data as Resource[]);
    if(p.data) setProjects(p.data as Project[]);
    if(a.data) setActivities(a.data as Activity[]);
    if(rv.data) setReviews(rv.data as Review[]);
    if(cr.data) setCrs(cr.data as ChangeRequest[]);
    setLoading(false);
  };

  useEffect(()=>{ loadAll(); },[]);

  const kpi = useMemo(()=>{
    const total=activities.length;
    const done=activities.filter(a=>a.status==='Done').length;
    const blocked=activities.filter(a=>a.status==='Blocked').length;
    const planned=activities.reduce((s,a)=>s+Number(a.planned_hours||0),0);
    const actual=activities.reduce((s,a)=>s+Number(a.actual_hours||0),0);
    const budget=projects.reduce((s,p)=>s+Number(p.budget||0),0);
    return {total,done,blocked,planned,actual,budget,progress:total?done/total*100:0};
  },[activities,projects]);

  if(!supabaseReady){
    return <div className="main"><div className="notice"><b>Supabase keys are missing.</b><br/>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables, then redeploy.</div></div>;
  }

  return <div className="shell">
    <aside className="side">
      <div className="brand">Invent Project Control</div>
      <div className="sub">Stage-gate sprint execution system</div>
      <div className="nav">
        <Nav tab={tab} setTab={setTab} id="dashboard" icon={<LayoutDashboard size={16}/>} label="Dashboard"/>
        <Nav tab={tab} setTab={setTab} id="projects" icon={<ListChecks size={16}/>} label="Project Master"/>
        <Nav tab={tab} setTab={setTab} id="activities" icon={<CheckCircle2 size={16}/>} label="Activities"/>
        <Nav tab={tab} setTab={setTab} id="kanban" icon={<KanbanSquare size={16}/>} label="Kanban"/>
        <Nav tab={tab} setTab={setTab} id="resources" icon={<Users size={16}/>} label="Resources"/>
        <Nav tab={tab} setTab={setTab} id="gantt" icon={<CalendarDays size={16}/>} label="Gantt"/>
        <Nav tab={tab} setTab={setTab} id="reviews" icon={<Clock size={16}/>} label="Reviews"/>
        <Nav tab={tab} setTab={setTab} id="cr" icon={<FileWarning size={16}/>} label="Change Requests"/>
      </div>
    </aside>
    <main className="main">
      <div className="top"><div><div className="title">{titleFor(tab)}</div><div className="muted">PM fills master once. Project, client and PM are linked everywhere.</div></div><button className="btn secondary" onClick={loadAll}><RefreshCw size={14}/> Refresh</button></div>
      {message && <div className="notice" style={{marginBottom:16}}>{message}</div>}
      {tab==='dashboard' && <Dashboard kpi={kpi} projects={projects} activities={activities} reviews={reviews} crs={crs}/>} 
      {tab==='projects' && <ProjectMaster clients={clients} resources={resources} projects={projects} reload={loadAll} setMessage={setMessage}/>} 
      {tab==='activities' && <Activities projects={projects} resources={resources} activities={activities} reload={loadAll} setMessage={setMessage}/>} 
      {tab==='kanban' && <Kanban activities={activities} reload={loadAll}/>} 
      {tab==='resources' && <Resources resources={resources} activities={activities} reload={loadAll}/>} 
      {tab==='gantt' && <Gantt activities={activities}/>} 
      {tab==='reviews' && <Reviews projects={projects} reviews={reviews} reload={loadAll}/>} 
      {tab==='cr' && <ChangeRequests projects={projects} crs={crs} reload={loadAll}/>} 
    </main>
  </div>;
}

function Nav({tab,setTab,id,label,icon}:any){return <button className={tab===id?'active':''} onClick={()=>setTab(id)}><span className="row">{icon}{label}</span></button>}
function titleFor(t:Tab){return ({dashboard:'Dashboard',projects:'Project Master',activities:'Activity Planner',kanban:'Live Kanban',resources:'40-Hour Resource Load',gantt:'Gantt Timeline',reviews:'Stage Gate Reviews',cr:'Change Requests'} as any)[t]}

function Dashboard({kpi,projects,activities,reviews,crs}:any){
 return <div className="grid">
  <div className="grid cols4">
    <Stat title="Projects" value={projects.length} sub="Active project master"/>
    <Stat title="Activities" value={kpi.total} sub={`${kpi.done} completed / ${kpi.blocked} blocked`}/>
    <Stat title="Progress" value={pct(kpi.progress)} sub="Completed activities"/>
    <Stat title="Budget" value={money(kpi.budget)} sub="Total planned budget"/>
  </div>
  <div className="grid cols3">
    <div className="card"><b>Execution health</b><div className="bar" style={{marginTop:14}}><span style={{width:`${kpi.progress}%`}}/></div><p className="muted">Planned hours: {kpi.planned} | Actual hours: {kpi.actual}</p></div>
    <div className="card"><b>Open reviews</b><div className="stat">{reviews.filter((r:any)=>r.review_status!=='Approved').length}</div><p className="muted">Gate reviews pending approval</p></div>
    <div className="card"><b>Open CR</b><div className="stat">{crs.filter((c:any)=>c.approval_status!=='Approved').length}</div><p className="muted">Scope / cost / timeline deviations</p></div>
  </div>
  <div className="card"><b>Recent activities</b><table className="table"><thead><tr><th>Project</th><th>Activity</th><th>Owner</th><th>Status</th><th>Planned hrs</th></tr></thead><tbody>{activities.slice(0,10).map((a:any)=><tr key={a.id}><td>{a.projects?.project_name}</td><td>{a.activity_name}</td><td>{a.resources?.resource_name}</td><td>{a.status}</td><td>{a.planned_hours}</td></tr>)}</tbody></table></div>
 </div>
}
function Stat({title,value,sub}:any){return <div className="card"><div className="muted">{title}</div><div className="stat">{value}</div><div className="muted">{sub}</div></div>}

function ProjectMaster({clients,resources,projects,reload,setMessage}:any){
 const [f,setF]=useState({project_id:'P002',project_name:'',client_id:'',pm_id:'',start_date:'',target_end_date:'',budget:'0',project_status:'Planning'});
 const pms=resources.filter((r:Resource)=>r.role==='Project Manager' || r.department==='PM');
 const save=async()=>{ if(!supabase) return; const {error}=await supabase.from('projects').insert([{...f,budget:Number(f.budget||0)}]); setMessage(error?error.message:'Project created. Client and PM will auto-link across all modules.'); reload(); };
 return <div className="grid">
  <div className="card"><div className="between"><b>Create project once</b><button className="btn" onClick={save}><Save size={14}/> Save Project</button></div>
   <div className="form-grid">
    <Field label="Project ID"><input value={f.project_id} onChange={e=>setF({...f,project_id:e.target.value})}/></Field>
    <Field label="Project Name"><input value={f.project_name} onChange={e=>setF({...f,project_name:e.target.value})}/></Field>
    <Field label="Client"><select value={f.client_id} onChange={e=>setF({...f,client_id:e.target.value})}><option value="">Select client</option>{clients.map((c:Client)=><option key={c.id} value={c.id}>{c.client_name}</option>)}</select></Field>
    <Field label="Project Manager"><select value={f.pm_id} onChange={e=>setF({...f,pm_id:e.target.value})}><option value="">Select PM</option>{pms.map((r:Resource)=><option key={r.id} value={r.id}>{r.resource_name}</option>)}</select></Field>
    <Field label="Start Date"><input type="date" value={f.start_date} onChange={e=>setF({...f,start_date:e.target.value})}/></Field>
    <Field label="Target End Date"><input type="date" value={f.target_end_date} onChange={e=>setF({...f,target_end_date:e.target.value})}/></Field>
    <Field label="Budget"><input type="number" value={f.budget} onChange={e=>setF({...f,budget:e.target.value})}/></Field>
    <Field label="Status"><select value={f.project_status} onChange={e=>setF({...f,project_status:e.target.value})}>{['Planning','Active','On Hold','Completed'].map(x=><option key={x}>{x}</option>)}</select></Field>
   </div>
  </div>
  <div className="card"><b>Project register</b><table className="table"><thead><tr><th>ID</th><th>Project</th><th>Client</th><th>PM</th><th>Status</th><th>Budget</th><th>Create roadmap</th></tr></thead><tbody>{projects.map((p:Project)=><tr key={p.id}><td>{p.project_id}</td><td>{p.project_name}</td><td>{p.clients?.client_name}</td><td>{p.resources?.resource_name}</td><td>{p.project_status}</td><td>{money(p.budget)}</td><td><button className="btn small secondary" onClick={()=>createRoadmap(p,resources,reload,setMessage)}>Auto-create activities</button></td></tr>)}</tbody></table></div>
 </div>
}
async function createRoadmap(p:Project,resources:Resource[],reload:any,setMessage:any){
 if(!supabase) return;
 const existing = await supabase.from('activities').select('id').eq('project_id',p.id).limit(1);
 if(existing.data && existing.data.length){ setMessage('Activities already exist for this project.'); return; }
 const byRole=(role:string)=> resources.find(r=>r.role===roleMap[role] || r.department===role || r.resource_name===role)?.id || p.pm_id;
 const rows = roadmapActivities.map((x:any)=>({project_id:p.id,phase:x[0],sprint:x[1],activity_name:x[2],activity_description:x[3],owner_id:byRole(x[4]),planned_hours:x[5],status:'To Do',priority:x[6],review_required:x[7],deliverable:x[8]}));
 const {error}= await supabase.from('activities').insert(rows);
 setMessage(error?error.message:`${rows.length} roadmap activities created for ${p.project_name}.`); reload();
}

function Activities({projects,resources,activities,reload,setMessage}:any){
 const [f,setF]=useState({project_id:'',phase:phases[0],sprint:'Sprint 0',activity_name:'',activity_description:'',owner_id:'',planned_hours:'8',status:'To Do',priority:'Medium',review_required:false,deliverable:'',planned_start:'',planned_end:''});
 const save=async()=>{ if(!supabase) return; const {error}=await supabase.from('activities').insert([{...f,planned_hours:Number(f.planned_hours||0)}]); setMessage(error?error.message:'Activity created and linked to project/client/PM.'); reload(); };
 const updateStatus=async(id:string,status:string)=>{ if(!supabase) return; await supabase.from('activities').update({status}).eq('id',id); reload(); };
 const updateHours=async(id:string,actual_hours:number)=>{ if(!supabase) return; await supabase.from('activities').update({actual_hours}).eq('id',id); reload(); };
 return <div className="grid">
  <div className="card"><div className="between"><b>Add activity</b><button className="btn" onClick={save}><Plus size={14}/> Add</button></div><div className="form-grid">
   <Field label="Project"><select value={f.project_id} onChange={e=>setF({...f,project_id:e.target.value})}><option value="">Select project</option>{projects.map((p:Project)=><option key={p.id} value={p.id}>{p.project_id} - {p.project_name}</option>)}</select></Field>
   <Field label="Phase"><select value={f.phase} onChange={e=>setF({...f,phase:e.target.value})}>{phases.map(x=><option key={x}>{x}</option>)}</select></Field>
   <Field label="Sprint"><input value={f.sprint} onChange={e=>setF({...f,sprint:e.target.value})}/></Field>
   <Field label="Activity"><input value={f.activity_name} onChange={e=>setF({...f,activity_name:e.target.value})}/></Field>
   <Field label="Owner"><select value={f.owner_id} onChange={e=>setF({...f,owner_id:e.target.value})}><option value="">Select owner</option>{resources.map((r:Resource)=><option key={r.id} value={r.id}>{r.resource_name} ({r.department})</option>)}</select></Field>
   <Field label="Planned Hours"><input type="number" value={f.planned_hours} onChange={e=>setF({...f,planned_hours:e.target.value})}/></Field>
   <Field label="Planned Start"><input type="date" value={f.planned_start} onChange={e=>setF({...f,planned_start:e.target.value})}/></Field>
   <Field label="Planned End"><input type="date" value={f.planned_end} onChange={e=>setF({...f,planned_end:e.target.value})}/></Field>
   <Field label="Deliverable"><input value={f.deliverable} onChange={e=>setF({...f,deliverable:e.target.value})}/></Field>
  </div><Field label="Description"><textarea value={f.activity_description} onChange={e=>setF({...f,activity_description:e.target.value})}/></Field></div>
  <div className="card"><b>Activity execution table</b><table className="table"><thead><tr><th>Project</th><th>Client</th><th>PM</th><th>Activity</th><th>Owner</th><th>Status</th><th>Plan</th><th>Actual</th><th>Deliverable</th></tr></thead><tbody>{activities.map((a:Activity)=><tr key={a.id}><td>{a.projects?.project_id} - {a.projects?.project_name}</td><td>{a.projects?.clients?.client_name}</td><td>{a.projects?.resources?.resource_name}</td><td>{a.activity_name}</td><td>{a.resources?.resource_name}</td><td><select value={a.status} onChange={e=>updateStatus(a.id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td>{a.planned_hours}</td><td><input type="number" value={a.actual_hours||0} onChange={e=>updateHours(a.id,Number(e.target.value))}/></td><td>{a.deliverable}</td></tr>)}</tbody></table></div>
 </div>
}

function Kanban({activities,reload}:any){
 const update=async(id:string,status:string)=>{ if(!supabase) return; await supabase.from('activities').update({status}).eq('id',id); reload(); };
 return <div className="kanban">{statuses.map(s=><div className="lane" key={s} onDragOver={e=>e.preventDefault()} onDrop={e=>update(e.dataTransfer.getData('id'),s)}><h3>{s} ({activities.filter((a:Activity)=>a.status===s).length})</h3>{activities.filter((a:Activity)=>a.status===s).map((a:Activity)=><div className="task" key={a.id} draggable onDragStart={e=>e.dataTransfer.setData('id',a.id)}><div className="task-title">{a.activity_name}</div><div className="muted">{a.projects?.project_id} | {a.resources?.resource_name}</div><div className="row" style={{marginTop:8}}><span className={`tag priority-${a.priority}`}>{a.priority}</span><span className="tag">{a.planned_hours}h</span></div></div>)}</div>)}</div>
}
function Resources({resources,activities,reload}:any){
 const rows = resources.map((r:Resource)=>{ const assigned=activities.filter((a:Activity)=>a.owner_id===r.id && a.status!=='Done'); const hrs=assigned.reduce((s:any,a:any)=>s+Number(a.planned_hours||0),0); const cap=Number(r.weekly_capacity_hours||40); return {r,assigned,hrs,cap,util:cap?hrs/cap*100:0}; });
 return <div className="grid"><div className="card"><b>Resource allocation against 40-hour week</b><table className="table"><thead><tr><th>Resource</th><th>Role</th><th>Capacity</th><th>Open planned hrs</th><th>Utilization</th><th>Health</th></tr></thead><tbody>{rows.map(({r,hrs,cap,util}:any)=><tr key={r.id}><td>{r.resource_name}</td><td>{r.role}</td><td>{cap}</td><td>{hrs}</td><td><div className="bar"><span style={{width:`${Math.min(util,100)}%`,background:util>100?'#dc2626':util>90?'#f59e0b':'#16a34a'}}/></div>{pct(util)}</td><td className={util>100?'danger':util>90?'warn':'ok'}>{util>100?'Overloaded':util>90?'Near full':'OK'}</td></tr>)}</tbody></table></div></div>
}
function Gantt({activities}:any){
 const dated=activities.filter((a:Activity)=>a.planned_start&&a.planned_end);
 if(!dated.length) return <div className="notice">No planned dates found. Add Planned Start and Planned End in Activity Planner to view Gantt.</div>;
 const min = Math.min(...dated.map((a:Activity)=>new Date(a.planned_start!).getTime()));
 const max = Math.max(...dated.map((a:Activity)=>new Date(a.planned_end!).getTime()));
 const span = Math.max(max-min,86400000);
 return <div className="card"><b>Timeline</b>{dated.map((a:Activity)=>{ const left=(new Date(a.planned_start!).getTime()-min)/span*100; const width=(new Date(a.planned_end!).getTime()-new Date(a.planned_start!).getTime())/span*100; return <div className="gantt-row" key={a.id}><div className="muted">{a.projects?.project_id} | {a.activity_name}</div><div className="timeline"><span className="ganttbar" style={{left:`${left}%`,width:`${Math.max(width,4)}%`}}/></div></div>})}</div>
}
function Reviews({projects,reviews,reload}:any){
 const [f,setF]=useState({project_id:'',review_type:'Gate Review',phase:phases[0],review_date:'',review_status:'Pending',decision:'',remarks:''});
 const save=async()=>{ if(!supabase) return; await supabase.from('reviews').insert([f]); reload(); };
 return <div className="grid"><div className="card"><div className="between"><b>Create review</b><button className="btn" onClick={save}>Save Review</button></div><div className="form-grid"><Field label="Project"><select value={f.project_id} onChange={e=>setF({...f,project_id:e.target.value})}><option value="">Select</option>{projects.map((p:Project)=><option value={p.id} key={p.id}>{p.project_id} - {p.project_name}</option>)}</select></Field><Field label="Phase"><select value={f.phase} onChange={e=>setF({...f,phase:e.target.value})}>{phases.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Date"><input type="date" value={f.review_date} onChange={e=>setF({...f,review_date:e.target.value})}/></Field></div><Field label="Remarks"><textarea value={f.remarks} onChange={e=>setF({...f,remarks:e.target.value})}/></Field></div><div className="card"><b>Reviews</b><table className="table"><thead><tr><th>Project</th><th>Type</th><th>Phase</th><th>Date</th><th>Status</th><th>Decision</th></tr></thead><tbody>{reviews.map((r:Review)=><tr key={r.id}><td>{r.projects?.project_name}</td><td>{r.review_type}</td><td>{r.phase}</td><td>{r.review_date}</td><td>{r.review_status}</td><td>{r.decision}</td></tr>)}</tbody></table></div></div>
}
function ChangeRequests({projects,crs,reload}:any){
 const [f,setF]=useState({project_id:'',cr_title:'',current_scope:'',proposed_change:'',reason:'',cost_impact:'0',timeline_impact_days:'0',approval_status:'Pending'});
 const save=async()=>{ if(!supabase) return; await supabase.from('change_requests').insert([{...f,cost_impact:Number(f.cost_impact||0),timeline_impact_days:Number(f.timeline_impact_days||0)}]); reload(); };
 return <div className="grid"><div className="card"><div className="between"><b>Raise CR when scope/timeline/cost changes</b><button className="btn" onClick={save}>Save CR</button></div><div className="form-grid"><Field label="Project"><select value={f.project_id} onChange={e=>setF({...f,project_id:e.target.value})}><option value="">Select</option>{projects.map((p:Project)=><option value={p.id} key={p.id}>{p.project_id} - {p.project_name}</option>)}</select></Field><Field label="CR Title"><input value={f.cr_title} onChange={e=>setF({...f,cr_title:e.target.value})}/></Field><Field label="Cost Impact"><input type="number" value={f.cost_impact} onChange={e=>setF({...f,cost_impact:e.target.value})}/></Field><Field label="Timeline Impact Days"><input type="number" value={f.timeline_impact_days} onChange={e=>setF({...f,timeline_impact_days:e.target.value})}/></Field></div><Field label="Current Scope"><textarea value={f.current_scope} onChange={e=>setF({...f,current_scope:e.target.value})}/></Field><Field label="Proposed Change"><textarea value={f.proposed_change} onChange={e=>setF({...f,proposed_change:e.target.value})}/></Field></div><div className="card"><b>CR tracker</b><table className="table"><thead><tr><th>Project</th><th>CR</th><th>Cost</th><th>Days</th><th>Status</th></tr></thead><tbody>{crs.map((c:ChangeRequest)=><tr key={c.id}><td>{c.projects?.project_name}</td><td>{c.cr_title}</td><td>{money(c.cost_impact)}</td><td>{c.timeline_impact_days}</td><td>{c.approval_status}</td></tr>)}</tbody></table></div></div>
}
function Field({label,children}:any){return <div><label>{label}</label>{children}</div>}
