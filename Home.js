
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], 
      loading: false,
      current : {},
      parents : [{
        id: 'root',
        mimeTYpe: 'application/vnd.google-apps.folder',
        name: "Root"
      }]
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.lastChange = 0
  }
  handleClick(item){
    var self = this
    return function(e){
      console.log(item)
      if (item.mimeType == 'application/vnd.google-apps.folder'){
        var parents=[]
        for(var i=0; i<self.state.parents.length; i++){
          if (self.state.parents[i].id==item.id){
            break;
          }
          parents.push(self.state.parents[i])
        }
        parents.push(item)
        self.setState({ data: [], current : item, parents: parents }) 
        window.setTimeout(() => {
          self.loadData()
        }, 300);
      }else{
        window.open(item.webViewLink,'preview','width=600,height=400')
        //window.open(item.webContentLink)
      }
      
    }
  }
  handleChange(event){
      //this.setState({search: event.target.value});
  }
  handleSubmit(event){
      event.preventDefault();
      var self = this
      window.clearTimeout(this.lastChange)
      this.setState({data: []});
      this.lastChange = window.setTimeout(() => {
          self.loadData()
      }, 300);
      return false;
  }
  loadData(){
      var headers = {
        Authorization : 'Bearer ya29.GltjBqJqxn3xRIQMTy6VOYq1XkAojYB3p26Cdc_VRR2S9Xf_r6uoqyf99JNcc6gw_Znh_x3EWD3STYfJoi0AbdTuIGvpBC-Vbuv-A57Cu1Z0dbxbOHJkgQqeFroM'
      }
      var parent='root'
      if (this.state.current.id){
        parent=this.state.current.id
      }
      console.log(parent, this.state.current.id, this.state.current)
      this.setState({loading: true})
      var conditions = []
      conditions.push("trashed = false")
      //conditions.push("mimeType = 'application/vnd.google-apps.folder'")
      conditions.push("'"+parent+"' in parents")
      var query=encodeURIComponent(conditions.join(" and "))
      var url = "https://www.googleapis.com/drive/v3/files?q="+ query + "&fields=files(copyRequiresWriterPermission%2CcreatedTime%2Cdescription%2CiconLink%2Cid%2Ckind%2CmimeType%2Cname%2CownedByMe%2Cparents%2Cproperties%2Cshared%2CsharingUser%2Csize%2CteamDriveId%2CthumbnailLink%2Ctrashed%2CwebContentLink%2CwebViewLink)%2CincompleteSearch%2Ckind%2CnextPageToken&key="
      //url = 'response.json'
      fetch(url,{headers,})
      .then(response => response.json())
      .then(data => { 
          if (data.files){
            this.setState({ data : data.files }) 
          }
          this.setState({loading: false}) 
          });
  }
  render() {
    var self = this
    var itemFunc= function(item, margin, header) {
      var style = {}
      if (header){
        style.fontWeight = 'bold'
      }
      if (margin>0){
        style.marginLeft = (margin*10) + 'px'
      }
      var img = ""
      if (item.iconLink) {
        img = <img src={item.iconLink} title={item.id} ></img>
      }
      var thumb = ""
      if (item.thumbnailLink){
        thumb = <span><br/><img src={item.thumbnailLink} title={item.id} ></img></span>
      }
      return <li style={style} key={item.id} className="collection-item" onClick={self.handleClick(item)} >
          {img} {item.name}
          {thumb}
      </li>
    }
    const parentItems = this.state.parents.map( function(item,pos){ return itemFunc(item,pos,true) });
    const listItems = this.state.data.map( function(item,pos){ return itemFunc(item,self.state.parents.length,false) });
    return (
      <main >
          <div className="container">
          
          <ul className="collection">
          {parentItems}
          {listItems}
          </ul>
          { this.state.loading ? <img width="100%" src="loading.gif" /> : null }
          </div>
      </main>  
    );
  }
  componentDidMount() {
      this.loadData()
  }
}