window.MemoryModule = (function(){
function renderMemoryView() {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--app-bg)', color:'var(--text-5)', fontSize:12 }}>
      Memory — belum ada konten
    </div>
  );
}
return { renderMemoryView };
})();
