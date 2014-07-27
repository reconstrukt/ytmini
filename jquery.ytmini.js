/*

ytmini - http://reconstrukt.com
Licensed under the MIT license
Matthew Knight, 2014

Responsive, mobile/tablet friendly YouTube player widget.  Includes skinnable playback controls in HTML/CSS.  
Uses the new YouTube Iframe API.  Dead-simple prototype, consider it a blueprint for something more serious.

Check the fiddle here: http://jsfiddle.net/reconstrukt/ARR7P/

*/

$(document).ready(function(){

	var vid = 'aXlDHdaQoiI';

	var player = function( vid ) {};
	var video = {
		controls : {
			interval : '',
			duration : 0,
			currtime : 0,
			init : function( yt ){
				
				video.log( 'controls init' );
				
				// reset
				video.controls.end();
				
				// set duration
				if ( yt && yt.getDuration ) {
					video.controls.duration = yt.getDuration();
				}
				
				// set timeout to update playhead
				if ( yt && yt.getCurrentTime ) {
					video.controls.interval = setInterval(function() {
						var oldtime = video.controls.currtime;
						var newtime = yt.getCurrentTime();
						if( newtime !== oldtime ) {
							video.controls.onProgress( newtime );
						}
					}, 100);
				}
				
				// bind play / pause
				$('.ytmini-controls-play').click(function(){
					if ( $(this).hasClass('active') ) {
						// now playing. pause
						video.log( 'controls pause' );
						yt.pauseVideo();
					} else {
						// now paused. play
						video.log( 'controls play' );
						yt.playVideo();
					}
				}).addClass('active');
				
				// reset playhead
				$('.ytmini-controls-playhead').css('width', '0px');
				video.controls.show();
				
			},
			onProgress : function( time ) {
				
				video.log( 'controls progress: ' + video.controls.currtime );					
				video.controls.currtime = time;
				
				// move playhead
				var pct = time / video.controls.duration;
				var wid = pct * $('.ytmini-controls-scrubber').width();					
				$('.ytmini-controls-playhead').css('width', wid + 'px');
				
			},
			end : function() {
				
				video.log( 'controls end' );
				
				// clear timeout
				clearInterval( video.controls.interval );
				video.controls.currtime = 0;
				video.controls.duration = 0;
				
				// unbind play / pause
				$('.ytmini-controls-play').unbind('click');
				video.controls.hide();
				
			},
			play : function() {
				$('.ytmini-controls-play').addClass('active');
			},
			pause : function() {
				$('.ytmini-controls-play').removeClass('active');			
			},
			hide : function() {
				$('.ytmini-controls').hide();
			},
			show : function() {
				$('.ytmini-controls').show();
			}
		},
		log : function( m ) {
			if ( window.console ) console.log( m );
		}
	};

	video.controls.hide();
	
	if ( !window.onYouTubeIframeAPIReady || window.onYouTubeIframeAPIReady === 'undefined' ) {
		
		// load yt lib
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		window.onYouTubeIframeAPIReady = function() {
			
			video.log('yt iframe api ready');
			
			video.player = new YT.Player( $('.ytmini-player').attr('id'), {
				height: '1005',
				width: '565',
				videoId: vid,
				playerVars: { 
					'controls' : 0,
					'modestbranding' : 1,
					'rel' : 0,
					'showinfo' : 0
				},
				events: {
					'onReady': function(event) {
						video.log('intro vid ready');
						// get some props, par example
						var url = video.player.getVideoUrl();
						// autoplay?
						video.player.playVideo();
					},
					'onStateChange': function(event) {				
						switch( event.data ) {
							case -1 :
								video.log( 'player unstarted' );
								break;
							case YT.PlayerState.ENDED :	
								video.log( 'player ended' );
								video.controls.end();
								break;
							case YT.PlayerState.PLAYING :
								video.log( 'player playing' );							
								video.controls.init( video.player );
								video.controls.play();
								break;
							case YT.PlayerState.PAUSED :
								video.log( 'player paused' );
								video.controls.pause();
								break;
							case YT.PlayerState.BUFFERING :
								video.log( 'player buffering' );
								break;
							case YT.PlayerState.CUED :
								video.log( 'player cued' );
								break;
						}
					}
				}
			});
		}
	}
	
	// interact with player
	$('.change-video').click(function(){
		
		console.log('external player interaction');

		var vid = $(this).attr('data-ytmini-id');

		video.player.stopVideo();		
		video.player.loadVideoById( vid );

		return false;
	});
	
});
