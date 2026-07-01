'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const statuses = ['To Do', 'In Progress', 'Review', 'Done'];
const phases = ['Discovery & Scope','Concept Development','POC 1','POC 2','Prototype','Testing & Validation','Pre-Production','Tooling Release'];

export default function Home() {
  const [view, setView] = useState('Dashboard');
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  const [crs, setCrs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [projectForm, setProjectForm] = useState({project_id:'',project_name:'',client_id:'',pm_id:'',start_date:'',target_end_date:'',budget:0,project_status:'Planning'});
  const [activityForm, setActivityForm] = useState({project_id:'',phase:'Discovery & Scope',sprint:'Sprint 0',activity_name:'',activity_description:'',owner_id:'',planned_start:'',planned_end:'',planned_hours:0,status:'To Do',priority:'Medium',review_required:false,deliverable:''});
  const [updateForm, setUpdateForm] = useState({activity_id:'',resource_id:'',hours_spent:0,update_note:'',status_update:'In Progress'});
  const [crForm, setCrForm] = useState({project_id:'',cr_title:'',current_scope:'',proposed_change:'',reason:'',cost_impact:0,timeline_impact_days:0});
  const [reviewForm, setReviewForm] = useState({project_id:'',review_type:'Gate Review',phase:'Discovery & Scope',review_date:'',review_status:'Pending',decision:'',remarks:''});

  useEffect(() => { loadAll(); }, []);

  async function loadAll(){
    setLoading(true);
    const [p,r,c,a,cr,rv] = await Promise.all([
      supabase.from('projects').select('*, clients(client_name), resources(resource_name)').order('created_at',{ascending:false}),
      supabase.from('resources').select('*').order('resource_name'),
      supabase.from('clients').select('*').order('client_name'),
      supabase.from('activities').select('*, projects(project_id, project_name, clients(client_name), resources(resource_name)), resources(resource_name, department)').order('created_at',{ascending:true}),
      supabase.from('change_requests').select('*, projects(project_id, project_name)').order('created_at',{ascending:false}),
      supabase.from('reviews').select('*, projects(project_id, project_name)').order('created_at',{ascending:false})
    ]);
    if(p.error || r.error || c.error || a.error) setMessage('Please check Supabase keys and table names.');
    setProjects(p.data || []); setResources(r.data || []); setClients(c.data || []); setActivities(a.data || []); setCrs(cr.data || []); setReviews(rv.data || []);
    setLoading(false);
  }

  const metrics = useMemo(() => {
    const total = activities.length;
    const done = activities.filter(x=>x.status==='Done').length;
    const openCr = crs.filter(x=>x.approval_status !== 'Approved').length;
    const spent = activities.reduce((s,x)=>s + Number(x.actual_hours||0),0);
    return {total, done, completion: total ? Math.round(done*100/total):0, openCr, spent};
  }, [activities, crs]);

  const resourceLoad = useMemo(() => resources.map(res => {
    const hours = activities.filter(a => a.owner_id === res.id && a.status !== 'Done').reduce((s,a)=>s+Number(a.planned_hours||0),0);
    const cap = Number(res.weekly_capacity_hours || 40);
    return {...res, allocated: hours, load: cap ? Math.round(hours*100/cap):0};
  }), [resources, activities]);

  async function createProject(e){
    e.preventDefault();
    const {error} = await supabase.from('projects').insert([projectForm]);
    setMessage(error ? error.message : 'Project created. PM and client are now linked through Project ID.');
    if(!error){ setProjectForm({project_id:'',project_name:'',client_id:'',pm_id:'',start_date:'',target_end_date:'',budget:0,project_status:'Planning'}); loadAll(); }
  }

  async function createActivity(e){
    e.preventDefault();
    const {error} = await supabase.from('activities').insert([{...activityForm, project_id: activityForm.project_id || projects[0]?.id}]);
    setMessage(error ? error.message : 'Activity assigned. Resource can now take and update it.');
    if(!error){ setActivityForm({...activityForm, activity_name:'', activity_description:'', planned_hours:0, deliverable:''}); loadAll(); }
  }

  async function updateActivityStatus(id,status){
    const {error} = await supabase.from('activities').update({status}).eq('id',id);
    if(error) setMessage(error.message); else loadAll();
  }

  async function addDailyUpdate(e){
    e.preventDefault();
    const activity = activities.find(a=>a.id===updateForm.activity_id);
    const newHours = Number(activity?.actual_hours || 0) + Number(updateForm.hours_spent || 0);
    const {error} = await supabase.from('daily_updates').insert([updateForm]);
    if(!error){ await supabase.from('activities').update({actual_hours:newHours, status:updateForm.status_update}).eq('id',updateForm.activity_id); }
    setMessage(error ? error.message : 'Daily update saved and actual hours updated.');
    if(!error){ setUpdateForm({...updateForm, hours_spent:0, update_note:''}); loadAll(); }
  }

  async function createCR(e){
    e.preventDefault();
    const {error} = await supabase.from('change_requests').insert([crForm]);
    setMessage(error ? error.message : 'Change request created.');
    if(!error){ setCrForm({...crForm, cr_title:'',current_scope:'',proposed_change:'',reason:'',cost_impact:0,timeline_impact_days:0}); loadAll(); }
  }

  async function createReview(e){
    e.preventDefault();
    const {error} = await supabase.from('reviews').insert([reviewForm]);
    setMessage(error ? error.message : 'Review created.');
    if(!error){ loadAll(); }
  }

  const nav = ['Dashboard','Projects','Activities','My Tasks','Kanban','Resources','Gantt','Reviews','Change Requests'];

  return <div className="app">
    <aside className="side"><div className="logo">Invent Project Control</div><div className="nav">{nav.map(n=><button key={n} className={view===n?'active':''} onClick={()=>setView(n)}>{n}</button>)}</div></aside>
    <main className="main">
      <div className="top"><div className="title"><h1>{view}</h1><p>Stage Gate + Sprint + Resource + Review system</p></div><button className="btn secondary" onClick={loadAll}>Refresh</button></div>
      {message && <div className="notice">{message}</div>}
      {loading ? <div className="card">Loading...</div> : null}
      {view==='Dashboard' && <Dashboard metrics={metrics} projects={projects} activities={activities} resourceLoad={resourceLoad} />}
      {view==='Projects' && <Projects projects={projects} clients={clients} resources={resources} form={projectForm} setForm={setProjectForm} createProject={createProject}/>} 
      {view==='Activities' && <Activities activities={activities} projects={projects} resources={resources} form={activityForm} setForm={setActivityForm} createActivity={createActivity} />}
      {view==='My Tasks' && <MyTasks activities={activities} resources={resources} form={updateForm} setForm={setUpdateForm} addDailyUpdate={addDailyUpdate} updateActivityStatus={updateActivityStatus}/>} 
      {view==='Kanban' && <Kanban activities={activities} updateStatus={updateActivityStatus}/>} 
      {view==='Resources' && <Resources resourceLoad={resourceLoad}/>} 
      {view==='Gantt' && <Gantt activities={activities}/>} 
      {view==='Reviews' && <Reviews reviews={reviews} projects={projects} form={reviewForm} setForm={setReviewForm} createReview={createReview}/>} 
      {view==='Change Requests' && <CR crs={crs} projects={projects} form={crForm} setForm={setCrForm} createCR={createCR}/>} 
    </main>
  </div>
}

function Dashboard({metrics,projects,activities,resourceLoad}){return <div className="grid"><div className="grid cols4"><Metric label="Projects" value={projects.length}/><Metric label="Activities" value={metrics.total}/><Metric label="Completion" value={metrics.completion+'%'}/><Metric label="Open CR" value={metrics.openCr}/></div><div className="grid cols2"><div className="card"><h3>Recent activities</h3><table className="table"><tbody>{activities.slice(0,8).map(a=><tr key={a.id}><td>{a.activity_name}<div className="small">{a.projects?.project_id} · {a.phase}</div></td><td><Status s={a.status}/></td></tr>)}</tbody></table></div><div className="card"><h3>Resource load</h3>{resourceLoad.map(r=><Load key={r.id} r={r}/>)}</div></div></div>}
function Metric({label,value}){return <div className="card"><div className="metric">{value}</div><div className="label">{label}</div></div>}
function Projects({projects,clients,resources,form,setForm,createProject}){return <div className="grid"><form className="card" onSubmit={createProject}><h3>Create project once</h3><div className="formgrid"><Field label="Project ID"><input className="input" value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})} required/></Field><Field label="Project Name"><input className="input" value={form.project_name} onChange={e=>setForm({...form,project_name:e.target.value})} required/></Field><Field label="Client"><select className="input" value={form.client_id} onChange={e=>setForm({...form,client_id:e.target.value})}><option value="">Select</option>{clients.map(c=><option value={c.id} key={c.id}>{c.client_name}</option>)}</select></Field><Field label="Project Manager"><select className="input" value={form.pm_id} onChange={e=>setForm({...form,pm_id:e.target.value})}><option value="">Select</option>{resources.filter(r=>r.department==='PM'||r.role?.includes('Project')).map(r=><option value={r.id} key={r.id}>{r.resource_name}</option>)}</select></Field><Field label="Start Date"><input type="date" className="input" value={form.start_date||''} onChange={e=>setForm({...form,start_date:e.target.value})}/></Field><Field label="Target End"><input type="date" className="input" value={form.target_end_date||''} onChange={e=>setForm({...form,target_end_date:e.target.value})}/></Field><Field label="Budget"><input type="number" className="input" value={form.budget||0} onChange={e=>setForm({...form,budget:e.target.value})}/></Field><Field label="Status"><input className="input" value={form.project_status} onChange={e=>setForm({...form,project_status:e.target.value})}/></Field></div><br/><button className="btn">Save Project</button></form><div className="card"><h3>Project master</h3><table className="table"><thead><tr><th>ID</th><th>Project</th><th>Client</th><th>PM</th><th>Status</th></tr></thead><tbody>{projects.map(p=><tr key={p.id}><td>{p.project_id}</td><td>{p.project_name}</td><td>{p.clients?.client_name}</td><td>{p.resources?.resource_name}</td><td>{p.project_status}</td></tr>)}</tbody></table></div></div>}
function Activities({activities,projects,resources,form,setForm,createActivity}){return <div className="grid"><form className="card" onSubmit={createActivity}><h3>Add activity</h3><div className="formgrid"><Field label="Project"><select className="input" value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})}>{projects.map(p=><option value={p.id} key={p.id}>{p.project_id} - {p.project_name}</option>)}</select></Field><Field label="Phase"><select className="input" value={form.phase} onChange={e=>setForm({...form,phase:e.target.value})}>{phases.map(p=><option key={p}>{p}</option>)}</select></Field><Field label="Sprint"><input className="input" value={form.sprint} onChange={e=>setForm({...form,sprint:e.target.value})}/></Field><Field label="Activity"><input className="input" value={form.activity_name} onChange={e=>setForm({...form,activity_name:e.target.value})} required/></Field><Field label="Owner"><select className="input" value={form.owner_id} onChange={e=>setForm({...form,owner_id:e.target.value})}><option value="">Select</option>{resources.map(r=><option value={r.id} key={r.id}>{r.resource_name} - {r.department}</option>)}</select></Field><Field label="Planned Hours"><input type="number" className="input" value={form.planned_hours} onChange={e=>setForm({...form,planned_hours:e.target.value})}/></Field><Field label="Start"><input type="date" className="input" value={form.planned_start||''} onChange={e=>setForm({...form,planned_start:e.target.value})}/></Field><Field label="End"><input type="date" className="input" value={form.planned_end||''} onChange={e=>setForm({...form,planned_end:e.target.value})}/></Field><Field label="Priority"><select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></Field><Field label="Deliverable"><input className="input" value={form.deliverable} onChange={e=>setForm({...form,deliverable:e.target.value})}/></Field><Field label="Review Required"><select className="input" value={form.review_required?'Yes':'No'} onChange={e=>setForm({...form,review_required:e.target.value==='Yes'})}><option>No</option><option>Yes</option></select></Field></div><br/><Field label="Description"><textarea className="input" rows="3" value={form.activity_description} onChange={e=>setForm({...form,activity_description:e.target.value})}/></Field><br/><button className="btn">Assign Activity</button></form><ActivityTable activities={activities}/></div>}
function ActivityTable({activities}){return <div className="card"><h3>All activities</h3><table className="table"><thead><tr><th>Project</th><th>Activity</th><th>Owner</th><th>Hours</th><th>Status</th></tr></thead><tbody>{activities.map(a=><tr key={a.id}><td>{a.projects?.project_id}<div className="small">{a.projects?.clients?.client_name} · PM: {a.projects?.resources?.resource_name}</div></td><td><b>{a.activity_name}</b><div className="small">{a.phase} · {a.sprint}</div></td><td>{a.resources?.resource_name}</td><td>{a.actual_hours||0}/{a.planned_hours||0}</td><td><Status s={a.status}/></td></tr>)}</tbody></table></div>}
function MyTasks({activities,resources,form,setForm,addDailyUpdate,updateActivityStatus}){const open=activities.filter(a=>a.status!=='Done');return <div className="grid cols2"><form className="card" onSubmit={addDailyUpdate}><h3>Daily update</h3><Field label="Activity"><select className="input" value={form.activity_id} onChange={e=>setForm({...form,activity_id:e.target.value})}><option value="">Select</option>{open.map(a=><option value={a.id} key={a.id}>{a.activity_name} - {a.resources?.resource_name}</option>)}</select></Field><br/><Field label="Resource"><select className="input" value={form.resource_id} onChange={e=>setForm({...form,resource_id:e.target.value})}><option value="">Select</option>{resources.map(r=><option value={r.id} key={r.id}>{r.resource_name}</option>)}</select></Field><br/><Field label="Hours Spent"><input type="number" step="0.25" className="input" value={form.hours_spent} onChange={e=>setForm({...form,hours_spent:e.target.value})}/></Field><br/><Field label="New Status"><select className="input" value={form.status_update} onChange={e=>setForm({...form,status_update:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></Field><br/><Field label="Update Note"><textarea className="input" rows="4" value={form.update_note} onChange={e=>setForm({...form,update_note:e.target.value})}/></Field><br/><button className="btn">Save Update</button></form><div className="card"><h3>Take activities one by one</h3>{open.map(a=><div className="task" key={a.id}><b>{a.activity_name}</b><div className="small">{a.projects?.project_id} · {a.resources?.resource_name} · {a.actual_hours||0}/{a.planned_hours||0} hrs</div><br/><div className="row">{statuses.map(s=><button className="btn secondary" key={s} onClick={()=>updateActivityStatus(a.id,s)}>{s}</button>)}</div></div>)}</div></div>}
function Kanban({activities,updateStatus}){return <div className="kanban">{statuses.map(s=><div className="lane" key={s}><h3>{s}</h3>{activities.filter(a=>a.status===s).map(a=><div className="task" key={a.id}><b>{a.activity_name}</b><div className="small">{a.projects?.project_id} · {a.resources?.resource_name}</div><div className="small">{a.phase} · {a.planned_hours||0} hrs</div><br/><select className="input" value={a.status} onChange={e=>updateStatus(a.id,e.target.value)}>{statuses.map(x=><option key={x}>{x}</option>)}</select></div>)}</div>)}</div>}
function Resources({resourceLoad}){return <div className="card"><h3>40-hour resource allocation</h3>{resourceLoad.map(r=><Load r={r} key={r.id}/>)}</div>}
function Load({r}){return <div style={{marginBottom:14}}><div className="row" style={{justifyContent:'space-between'}}><b>{r.resource_name}</b><span className={r.load>100?'pill red':'pill'}>{r.allocated}/{r.weekly_capacity_hours||40} hrs · {r.load}%</span></div><div className={r.load>100?'progressbar over':'progressbar'}><div style={{width:Math.min(r.load,100)+'%'}}></div></div><div className="small">{r.department} · {r.role}</div></div>}
function Gantt({activities}){return <div className="card gantt"><h3>Simple Gantt timeline</h3><div className="timeline"><div><b>Activity</b></div>{Array.from({length:16},(_,i)=><div key={i}>W{i+1}</div>)}{activities.slice(0,30).map((a,i)=><GanttRow key={a.id} a={a} i={i}/>)}</div></div>}
function GanttRow({a,i}){const start=(i%8)+1; const span=Math.max(1,Math.min(6,Math.ceil(Number(a.planned_hours||8)/8))); return <><div>{a.activity_name}<div className="small">{a.resources?.resource_name}</div></div>{Array.from({length:16},(_,idx)=> idx===start ? <div key={idx} className="bar" style={{gridColumn:`span ${span}`}}>{a.sprint}</div> : (idx>start && idx<start+span ? null : <div key={idx}></div>))}</>}
function Reviews({reviews,projects,form,setForm,createReview}){return <div className="grid cols2"><form className="card" onSubmit={createReview}><h3>Create review</h3><Field label="Project"><select className="input" value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})}>{projects.map(p=><option value={p.id} key={p.id}>{p.project_id} - {p.project_name}</option>)}</select></Field><br/><Field label="Review Type"><input className="input" value={form.review_type} onChange={e=>setForm({...form,review_type:e.target.value})}/></Field><br/><Field label="Phase"><select className="input" value={form.phase} onChange={e=>setForm({...form,phase:e.target.value})}>{phases.map(p=><option key={p}>{p}</option>)}</select></Field><br/><Field label="Date"><input type="date" className="input" value={form.review_date||''} onChange={e=>setForm({...form,review_date:e.target.value})}/></Field><br/><Field label="Decision"><input className="input" value={form.decision} onChange={e=>setForm({...form,decision:e.target.value})}/></Field><br/><Field label="Remarks"><textarea className="input" rows="3" value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})}/></Field><br/><button className="btn">Save Review</button></form><div className="card"><h3>Reviews</h3><table className="table"><tbody>{reviews.map(r=><tr key={r.id}><td>{r.projects?.project_id}<br/><span className="small">{r.phase}</span></td><td>{r.review_type}<br/><span className="small">{r.review_date}</span></td><td>{r.review_status}</td></tr>)}</tbody></table></div></div>}
function CR({crs,projects,form,setForm,createCR}){return <div className="grid cols2"><form className="card" onSubmit={createCR}><h3>Change request</h3><Field label="Project"><select className="input" value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})}>{projects.map(p=><option value={p.id} key={p.id}>{p.project_id} - {p.project_name}</option>)}</select></Field><br/><Field label="CR Title"><input className="input" value={form.cr_title} onChange={e=>setForm({...form,cr_title:e.target.value})}/></Field><br/><Field label="Current Scope"><textarea className="input" rows="2" value={form.current_scope} onChange={e=>setForm({...form,current_scope:e.target.value})}/></Field><br/><Field label="Proposed Change"><textarea className="input" rows="2" value={form.proposed_change} onChange={e=>setForm({...form,proposed_change:e.target.value})}/></Field><br/><Field label="Reason"><textarea className="input" rows="2" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></Field><br/><div className="grid cols2"><Field label="Cost Impact"><input type="number" className="input" value={form.cost_impact} onChange={e=>setForm({...form,cost_impact:e.target.value})}/></Field><Field label="Timeline Impact Days"><input type="number" className="input" value={form.timeline_impact_days} onChange={e=>setForm({...form,timeline_impact_days:e.target.value})}/></Field></div><br/><button className="btn">Create CR</button></form><div className="card"><h3>Open change requests</h3><table className="table"><tbody>{crs.map(cr=><tr key={cr.id}><td><b>{cr.cr_title}</b><div className="small">{cr.projects?.project_id} · ₹{cr.cost_impact||0} · {cr.timeline_impact_days||0} days</div></td><td>{cr.approval_status}</td></tr>)}</tbody></table></div></div>}
function Field({label,children}){return <div className="field"><label>{label}</label>{children}</div>}
function Status({s}){const cls=s==='Done'?'done':s==='Review'?'review':s==='In Progress'?'progress':'todo';return <span className={'pill '+cls}>{s}</span>}
