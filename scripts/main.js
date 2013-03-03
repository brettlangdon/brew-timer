var warning_time = 60;
var warning_enabled = true;
var finished_audio = '#answering-machine';
var warning_audio = '#beep';
var completed_audio = '#clinking';
var started = false;
var update_timeout = null;
var start_time = null;
var stop_time = null;
var remaining_time = null;
var elapsed_time = null;
var steps = [];


$(document).ready(function(){
    $('#set').click(start_timer);
    $('#stop').click(stop_timer);
    $('#add').click(add_step);
    $('#open-settings').click(open_settings);
    $('#settings #save').click(save_settings);
});

var start_timer = function(){
    remaining_time = parseFloat($('#total').val());
    elapsed_time = 0;
    if(!remaining_time){
	alert('invalid number: ' + $('#total').val());
	return false;
    }

    remaining_time *= 60;

    start_time = new Date().getTime();
    stop_time = start_time + (remaining_time * 1000);
    update_timers();
    $('#set-timer').hide();
    $('#stop-timer').show();
};

var stop_timer = function(){
    $('#total').val(round(remaining_time / 60, 2));
    if(update_timeout){
	clearTimeout(update_timeout);
    }
    $('#set-timer').show();
    $('#stop-timer').hide();
};

var update_timers = function(){
    remaining_time -= 1;
    elapsed_time -= 1;

    if(remaining_time > 0){
	update_timeout = setTimeout(update_timers, 1000);
    } else{
	play(finished_audio);
	$('#set-timer').show();
	$('#stop-timer').hide();
    }

    $('#remaining h3').html(format_time(remaining_time));
    $('#elapsed h3').html('-' + format_time(elapsed_time));

    var now = new Date().getTime();
    var true_total = Math.floor((stop_time - start_time) / 1000);
    var true_elapsed = Math.floor((start_time - now) / 1000);
    var true_remaining = Math.floor((stop_time - now) / 1000);
    if(true_elapsed != elapsed_time || true_remaining != remaining_time || (elapsed_time + remaining_time) != true_total){
	remaining_time = Math.floor((stop_time - now) / 1000);
	elapsed_time = true_elapsed;
    }

    check_steps(true_remaining);
};


var format_time = function(time){
    time = Math.abs(time);
    var hours = Math.floor(time / 3600);
    time -= hours * 3600;
    var minutes = Math.floor(time / 60);
    time -= minutes * 60;
    var seconds = round(time, 0);

    return less_than_ten(hours) + ':' + less_than_ten(minutes) + ':' + less_than_ten(seconds);
};

var less_than_ten = function(time){
    return (time < 10)? '0' + time : time;
};

var add_step = function(){
    var step = {
	at: round(parseFloat($('#add-step #time').val()), 2),
	name: $('#add-step #name').val()
    };
    if(!step.at){
	alert('invalid number: ' + $('#add-step #time').val());
	return false;
    }

    if(!step.name || step.name == ''){
	alert('invalid name: ' + step.name);
	return false;
    }

    step.at *= 60;
    steps.push(step);
    write_steps();

    $('#add-step #time').val('');
    $('#add-step #name').val('');
};

var write_steps = function(){
    steps.sort(function(a, b){
	return a.at < b.at;
    });
    $('#steps .step').remove();

    for(var i in steps){
	var step = steps[i];
	var html = $('<div class="step row"/>');
	html.append('<div class="six columns"><h5 class="name">' + step.name + '</h5></div>');
	html.append('<div class="two columns"><h5 class="at">' + format_time(step.at) + '</h5></div>');
	html.append('<div class="two columns end"><button class="remove button">Remove Step</button></div>');
	$('#steps #list').append(html);
    }

    $('#steps #list .remove').click(remove_step);
};


var remove_step = function(){
    var step = $(this).parent().parent()
    var columns = step.children('.columns');
    var name = columns.children('.name').html();
    var at = parseFloat(columns.children('.at').html()) * 60;

    var remove = null;
    for(var i in steps){
	var step = steps[i];
	if(step.at == at && step.name == name){
	    remove = i;
	    break;
	}
    }
    if(remove >= 0){
	steps.splice(i, 1);
    }

    write_steps();
};


var check_steps = function(time){
    $('#steps #list .step').each(function(){
	var columns = $(this).children('.columns');
	var at = columns.children('.at').html();
	var matches = at.match('([0-9]+):([0-9]+):([0-9]+)');
	at = parseInt(matches[1]) * 3600;
	at += parseInt(matches[2] * 60);
	at += parseInt(matches[3]);
	if(at > time){
	    $(this).addClass('completed');
	    $(this).removeClass('current');
	} else if(at == time){
	    $(this).removeClass('warning');
	    $(this).addClass('current');
	    play(completed_audio)
	} else if(warning_enabled && warning_time){
	    if(time <= (at + warning_time) && time >= at){
		if(!$(this).hasClass('warning')){
		    $(this).addClass('warning');
		    play(warning_audio);
		}
	    } else{
		$(this).removeClass('warning');
	    }
	} else{
	    $(this).removeClass('current');
	    $(this).removeClass('completed');
	}
    });
};

var round = function(num, num_places){
    num_places = Math.pow(10, num_places);
    return Math.round(num * num_places) / num_places;
};


var save_settings = function(){
    warning_time = parseFloat($('#warning-time').val()) * 60;
    warning_enabled = $('.switch #on').prop('checked');
    finished_audio = $('#finished-audio').val();
    completed_audio = $('#step-audio').val();
    warning_audio = $('#warning-audio').val();

    $('#settings a.close-reveal-modal').click();
};


var open_settings = function(){
    $('#warning-time').val(round(warning_time / 60, 2));

    if(warning_enabled){
	$('.switch #on').prop('checked', true);
	$('.switch #off').removeAttr('checked');
    } else{
	$('.switch #off').prop('checked', true);
	$('.switch #on').removeAttr('checked');
    }

    $('#settings #finished-audio').children('option').each(function(){
	if($(this).val() == finished_audio){
	    $(this).prop('selected', true);
	} else{
	    $(this).removeAttr('selected');
	}
    });

    $('#settings #warning-audio').children('option').each(function(){
	if($(this).val() == warning_audio){
	    $(this).prop('selected', true);
	} else{
	    $(this).removeAttr('selected');
	}
    });

    $('#settings #step-audio').children('option').each(function(){
	if($(this).val() == completed_audio){
	    $(this).prop('selected', true);
	} else{
	    $(this).removeAttr('selected');
	}
    });
};


var play = function(id){
    $(id).trigger('load');
    $(id).trigger('play');
}
