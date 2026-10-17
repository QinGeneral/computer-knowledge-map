import Foundation
import Vision
import ImageIO
import CoreGraphics
let root=URL(fileURLWithPath:CommandLine.arguments[1]);let out=URL(fileURLWithPath:CommandLine.arguments[2])
for url in try FileManager.default.contentsOfDirectory(at:root,includingPropertiesForKeys:nil).filter({$0.pathExtension=="jpg" && !$0.lastPathComponent.contains("-thumb")}).sorted(by:{$0.path<$1.path}) {
 autoreleasepool {do {
  guard let src=CGImageSourceCreateWithURL(url as CFURL,nil),let im=CGImageSourceCreateImageAtIndex(src,0,nil) else{return}
  var rows=[[String:Any]]()
  let pos:[Double]=[0,0.3,0.6];let side:Double=0.4
  for x in pos {for y in pos {
   let rect=CGRect(x:x*Double(im.width),y:y*Double(im.height),width:side*Double(im.width),height:side*Double(im.height)).integral
   guard let crop=im.cropping(to:rect) else{continue}
   let req=VNRecognizeTextRequest();req.recognitionLevel = .accurate;req.recognitionLanguages=["zh-Hans","en-US"];req.usesLanguageCorrection=false;req.minimumTextHeight=0.002
   try VNImageRequestHandler(cgImage:crop,options:[:]).perform([req])
   for o in req.results ?? [] {if let t=o.topCandidates(1).first {let b=o.boundingBox
    rows.append(["text":t.string,"confidence":t.confidence,"x":(rect.minX+b.minX*rect.width)/Double(im.width),"y":(rect.minY+(1-b.maxY)*rect.height)/Double(im.height),"w":b.width*rect.width/Double(im.width),"h":b.height*rect.height/Double(im.height),"tile":true])
   }}
  }}
  let orig=out.appendingPathComponent(url.deletingPathExtension().lastPathComponent+".json")
  if let d=try? Data(contentsOf:orig),let r=try? JSONSerialization.jsonObject(with:d) as? [[String:Any]] {rows+=r}
  try JSONSerialization.data(withJSONObject:rows,options:[.prettyPrinted,.sortedKeys]).write(to:orig)
  print(url.lastPathComponent,rows.count)
 }catch{print("ERROR",url.lastPathComponent,error)}}
}
