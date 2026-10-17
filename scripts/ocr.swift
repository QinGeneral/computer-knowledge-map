import Foundation
import Vision
import AppKit
let src=URL(fileURLWithPath:CommandLine.arguments[1])
let out=URL(fileURLWithPath:CommandLine.arguments[2])
for url in try FileManager.default.contentsOfDirectory(at:src,includingPropertiesForKeys:nil).filter({$0.pathExtension.lowercased()=="jpg" && !$0.lastPathComponent.contains("-thumb")}).sorted(by:{$0.path<$1.path}) {
  autoreleasepool {
    do {
      let req=VNRecognizeTextRequest()
      req.recognitionLevel = .accurate
      req.recognitionLanguages=["zh-Hans","en-US"]
      req.usesLanguageCorrection=false
      try VNImageRequestHandler(url:url,options:[:]).perform([req])
      let rows=(req.results ?? []).compactMap { o -> [String:Any]? in
        guard let t=o.topCandidates(1).first else{return nil}
        let b=o.boundingBox
        return ["text":t.string,"confidence":t.confidence,"x":b.minX,"y":1-b.maxY,"w":b.width,"h":b.height]
      }
      let data=try JSONSerialization.data(withJSONObject:rows,options:[.prettyPrinted,.sortedKeys])
      try data.write(to:out.appendingPathComponent(url.deletingPathExtension().lastPathComponent+".json"))
      print(url.lastPathComponent,rows.count)
    } catch {print("ERROR",url.lastPathComponent,error)}
  }
}
