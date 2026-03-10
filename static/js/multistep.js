function NA_pre(t, v) {
    const $input = $('#A_' + t);
    
    // 赋值操作
    if ($input.length > 0) {
        $input.val(v);
    }

    // 联动逻辑：如果是 mode，更新按钮下拉列表
    if (t === 'mode') {
        $("#A_button_down, #A_button_up").empty();
        $.each(GLOB_CONF.BUTTON, function(_, x) {
            if (x.data.includes(v)) {
                const opt = `<option value="${x.val}">${x.title}</option>`;
                if (x.mod === 'down') $("#A_button_down").append(opt);
                if (x.mod === 'up') $("#A_button_up").append(opt);
            }
        });
    }

    // 更新样式（高亮选中的块）
    NA_pres();

    // 【核心修正】延迟触发下一步，确保 DOM 状态已更新
    setTimeout(() => {
        $('#next').trigger('click');
    }, 50);
}

/**
 * 3. 分步控制核心：增加阻断校验
 */
function step_() {
    let current = 0;
    let preventResponse = false;
    const $slides = $('.step-slide');
    const $steps = $('.step');

    // 初始化显示
    $('.step-main').css("height", getMaxHeight());
    $slides.hide().eq(current).show();
    $steps.eq(current).addClass("current");

    $('#next').off('click').on('click', function() {
        if (preventResponse) return;

        // 校验逻辑
        let GOCMD = 'y';
        const modeVal = $('#A_mode').val();
        const groupVal = $('#A_groups').val();
        const nameVal = $('#A_name').val();

        // 根据当前步骤拦截
        if (current === 0 && !modeVal) GOCMD = '请选择设备类型';
        else if (current === 1 && !groupVal) GOCMD = '请选择所属位置';
        else if (current === 2 && !nameVal) GOCMD = '请输入设备名称';

        if (GOCMD !== 'y') {
            info_cmd('danger', GOCMD, 'add_info');
            return;
        }

        // 切换下一步
        if (current < $slides.length - 1) {
            $steps.eq(current).addClass("completed");
            current++;
            
            $('#A_current').val(current);
            
            setTimeout(() => { $steps.eq(current).addClass("current"); }, 200);

            $slides.eq(current).stop().fadeIn(500).siblings('.step-slide').fadeOut(500);

            // 按钮文案
            if (current === ($slides.length - 1)) {
                $(this).html('<a href="javascript:void(0);" onclick="add_newlist_save()" class="btn btn-success">保存</a>');
            } else {
                $(this).html("下一步");
            }

            $('#pre').toggleClass('unVisible', current === 0);

            preventResponse = true;
            setTimeout(() => { preventResponse = false; }, 500);
            NA_pres();
        }
    });

    $('#pre').off('click').on('click', function() {
        if (preventResponse || current === 0) return;

        $steps.eq(current).removeClass("current");
        current--;
        
        $('#A_current').val(current);
        setTimeout(() => { $steps.eq(current).removeClass("completed"); }, 200);

        $slides.eq(current).stop().fadeIn(500).siblings('.step-slide').fadeOut(500);
        $('#next').html("下一步");
        $(this).toggleClass('unVisible', current === 0);

        preventResponse = true;
        setTimeout(() => { preventResponse = false; }, 500);
        NA_pres();
    });
}

/**
 * 4. 样式状态同步
 */
function NA_pres() {
    const m = $('#A_mode').val();
    const g = $('#A_groups').val();

    if (window.L_MODE) {
        $.each(L_MODE.data, (_, x) => {
            $(`#CS_${x.mode}`).css('background-color', x.mode === m ? '#e9ecef' : '#d4edda');
        });
    }
    if (window.L_GROUP) {
        $.each(L_GROUP.data, (_, x) => {
            $(`#CS_${x.val}`).css('background-color', x.val === g ? '#e9ecef' : '#fff3cd');
        });
    }
}

/**
 * 5. 获取高度助手
 */
function getMaxHeight() {
    let max = 0;
    $('.step-slide').each(function() {
        const h = $(this).outerHeight();
        if (h > max) max = h;
    });
    return max > 0 ? max : 'auto';
}