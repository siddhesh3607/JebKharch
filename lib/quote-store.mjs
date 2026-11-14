import fs from 'node:fs';
import path from 'node:path';
/** Single-process quote journal. A redeemed quote stays consumed across restarts. */
export class QuoteStore {
 constructor(file,{now=Date.now,max=10000}={}){this.file=file;this.now=now;this.max=max;this.entries=new Map(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[]);this.prune();}
 save(){fs.mkdirSync(path.dirname(this.file),{recursive:true});const temp=this.file+'.tmp';fs.writeFileSync(temp,JSON.stringify([...this.entries]));fs.renameSync(temp,this.file);}
 prune(){for(const [id,q] of this.entries)if(q.expires<this.now())this.entries.delete(id);this.save();}
 get(id){return this.entries.get(id);}
 set(id,quote){this.prune();if(this.entries.size>=this.max)throw Error('Quote capacity reached; retry after existing quotes expire');this.entries.set(id,quote);this.save();}
 consume(id){const q=this.get(id);if(!q||q.used||q.expires<this.now())return false;q.used=true;this.save();return true;}
}
